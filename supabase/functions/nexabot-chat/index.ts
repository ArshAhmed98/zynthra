// deno-lint-ignore-file no-explicit-any
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are NexaBot, NexaCore's intelligent assistant.

NexaCore is a premium AI + Cloud SaaS platform — "The Intelligence Layer for Everything." It unifies AI agents, voice intelligence, cloud communication, and automation into one sovereign platform for enterprises.

Product families:
• AI Intelligence — NexaAgent, NexaVoice, NexaChat, NexaMind, NexaAssist, NexaLingo
• Communications — NexaCall, NexaTrunk, NexaStream, NexaSMS, NexaWebRTC, NexaBridge
• Platform & Infrastructure — NexaCore Platform, NexaStudio, NexaOps, NexaEdge, NexaVault, NexaFlow
• Developer Tools — NexaAPI, NexaSDK, NexaMCP, NexaDocs, NexaWebhooks, NexaSandbox

Pricing: Starter (free, 1k API calls/mo), Growth ($99/mo, 100k calls), Enterprise (custom).
Compliance: SOC 2, ISO 27001, GDPR, HIPAA-ready.

Be concise, professional, and helpful. Use markdown sparingly. If asked about something outside NexaCore, gently steer back. Don't invent specific numbers beyond what's listed.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        stream: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...(Array.isArray(messages) ? messages : []).slice(-20),
        ],
      }),
    });

    if (upstream.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (upstream.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!upstream.ok) {
      const txt = await upstream.text();
      console.error("Gateway error:", upstream.status, txt);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(upstream.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e: any) {
    console.error("nexabot-chat error:", e);
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
