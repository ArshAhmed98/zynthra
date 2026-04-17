
-- ============ ROLES SYSTEM ============
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ ADMIN PASSWORD + LOCKOUT ============
CREATE TABLE public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash text,
  chatbot_system_prompt text DEFAULT 'You are NexaBot, a helpful AI assistant for NexaCore.',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read settings" ON public.admin_settings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update settings" ON public.admin_settings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert settings" ON public.admin_settings FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.admin_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address text,
  success boolean NOT NULL DEFAULT false,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log attempts" ON public.admin_login_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view attempts" ON public.admin_login_attempts FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view own attempts" ON public.admin_login_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX idx_admin_attempts_user_time ON public.admin_login_attempts(user_id, attempted_at DESC);

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  icon text NOT NULL DEFAULT 'Bot',
  accent text NOT NULL DEFAULT 'cyan',
  version text NOT NULL DEFAULT 'v3',
  sort_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads visible products" ON public.products FOR SELECT USING (is_visible = true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ PRICING TIERS ============
CREATE TABLE public.pricing_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_key text NOT NULL UNIQUE,
  name text NOT NULL,
  monthly_price numeric,
  annual_price numeric,
  suffix text DEFAULT '/mo',
  cta_label text NOT NULL DEFAULT 'Get Started',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_popular boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads visible tiers" ON public.pricing_tiers FOR SELECT USING (is_visible = true);
CREATE POLICY "Admins manage tiers" ON public.pricing_tiers FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ SITE VIDEOS ============
CREATE TABLE public.site_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  section text NOT NULL DEFAULT 'demo',
  sort_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads visible videos" ON public.site_videos FOR SELECT USING (is_visible = true);
CREATE POLICY "Admins manage videos" ON public.site_videos FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ CHAT CONVERSATIONS ============
CREATE TYPE public.chat_status AS ENUM ('active', 'needs_human', 'handled_by_admin', 'closed');

CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  visitor_name text,
  visitor_email text,
  status chat_status NOT NULL DEFAULT 'active',
  assigned_admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_chat_conv_session ON public.chat_conversations(session_id);
CREATE INDEX idx_chat_conv_status ON public.chat_conversations(status, last_message_at DESC);

CREATE POLICY "Anyone create conversation" ON public.chat_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Owner read own conversation" ON public.chat_conversations FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins read all conversations" ON public.chat_conversations FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update conversations" ON public.chat_conversations FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner update own conversation" ON public.chat_conversations FOR UPDATE USING (auth.uid() = user_id);

CREATE TYPE public.chat_role AS ENUM ('user', 'assistant', 'admin', 'system');

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role chat_role NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_chat_msg_conv ON public.chat_messages(conversation_id, created_at);

CREATE POLICY "Anyone insert in conversation" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Read messages of own conversation" ON public.chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_conversations c WHERE c.id = conversation_id AND (c.user_id = auth.uid() OR c.user_id IS NULL))
);
CREATE POLICY "Admins read all messages" ON public.chat_messages FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- ============ updated_at triggers ============
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_pricing_updated BEFORE UPDATE ON public.pricing_tiers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_videos_updated BEFORE UPDATE ON public.site_videos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SEED ADMIN SETTINGS ============
INSERT INTO public.admin_settings (password_hash) VALUES (NULL);

-- ============ SEED PRICING TIERS ============
INSERT INTO public.pricing_tiers (tier_key, name, monthly_price, annual_price, suffix, cta_label, features, is_popular, sort_order) VALUES
('starter', 'Starter', 0, 0, '/mo', 'Start Free', '["10K API calls/month","2 AI agents","Community support","Basic analytics"]'::jsonb, false, 0),
('growth', 'Growth', 99, 79, '/mo', 'Start 14-day Trial', '["1M API calls/month","Unlimited AI agents","Priority support","Advanced analytics","Custom integrations","Voice + Chat APIs"]'::jsonb, true, 1),
('enterprise', 'Enterprise', NULL, NULL, '', 'Talk to Sales', '["Unlimited everything","Dedicated infrastructure","24/7 white-glove support","Custom SLAs","SSO + SAML","On-premise option"]'::jsonb, false, 2);

-- ============ SEED PRODUCTS ============
INSERT INTO public.products (name, description, category, icon, accent, sort_order) VALUES
('NexaAgent','Autonomous AI agents for enterprise workflows','ai','Bot','cyan',0),
('NexaVoice','GenAI-powered voice bot with real-time speech','ai','Mic','violet',1),
('NexaChat','Intelligent chat agents with context memory','ai','MessageSquare','coral',2),
('NexaMind','Conversation intelligence & quality analysis','ai','Brain','cyan',3),
('NexaAssist','Real-time agent guidance & coaching','ai','Headphones','violet',4),
('NexaLingo','Multilingual AI translation engine','ai','Languages','coral',5),
('NexaCall','Cloud telephony & smart IVR','comms','Phone','cyan',6),
('NexaTrunk','Dynamic SIP trunking at scale','comms','Network','violet',7),
('NexaStream','Voice streaming for bots & agents','comms','Radio','coral',8),
('NexaSMS','Business messaging: SMS, WhatsApp, RCS','comms','MessageCircle','cyan',9),
('NexaWebRTC','In-app voice/video calling APIs','comms','Video','violet',10),
('NexaBridge','Omnichannel routing engine','comms','Workflow','coral',11),
('NexaCore Platform','Unified AI + human harmony layer','platform','Layers','cyan',12),
('NexaStudio','No-code agent & bot builder','platform','Wand2','violet',13),
('NexaOps','LLM orchestration & deployment','platform','Cpu','coral',14),
('NexaEdge','On-device / edge AI inference','platform','Server','cyan',15),
('NexaVault','Encrypted data store & compliance vault','platform','Lock','violet',16),
('NexaFlow','Visual workflow automation builder','platform','GitBranch','coral',17),
('NexaAPI','REST + WebSocket APIs','dev','Code2','cyan',18),
('NexaSDK','Mobile & web SDKs (iOS, Android, JS)','dev','Smartphone','violet',19),
('NexaMCP','Model context protocol server','dev','BoxSelect','coral',20),
('NexaDocs','Interactive API documentation','dev','FileText','cyan',21),
('NexaWebhooks','Real-time event streaming','dev','Rss','violet',22),
('NexaSandbox','Live testing environment','dev','FlaskConical','coral',23);
