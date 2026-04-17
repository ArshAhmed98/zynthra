import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// ---------- helpers ----------
async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const LOCKOUT_MS = 15 * 60 * 1000;
const MAX_FAILS = 5;

// ---------- check admin password setup state ----------
export const getAdminSetupState = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data } = await supabaseAdmin
      .from("admin_settings")
      .select("password_hash")
      .limit(1)
      .maybeSingle();
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    return {
      passwordSet: !!data?.password_hash,
      adminExists: (count ?? 0) > 0,
    };
  },
);

// ---------- bootstrap admin (only if no admin exists) ----------
export const bootstrapAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { password: string }) =>
    z.object({ password: z.string().min(8).max(128) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    // Only allowed if no admin currently exists
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) {
      throw new Error("Admin already exists. Ask an existing admin to grant access.");
    }
    // Grant admin role
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (roleErr) throw new Error(roleErr.message);

    // Set admin password (upsert into single settings row)
    const passwordHash = await sha256(data.password);
    const { data: existing } = await supabaseAdmin
      .from("admin_settings")
      .select("id")
      .limit(1)
      .maybeSingle();
    if (existing) {
      await supabaseAdmin
        .from("admin_settings")
        .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabaseAdmin
        .from("admin_settings")
        .insert({ password_hash: passwordHash });
    }
    return { ok: true };
  });

// ---------- verify admin password (with lockout) ----------
export const verifyAdminPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { password: string }) =>
    z.object({ password: z.string().min(1).max(128) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Check role
    const { data: role } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Not authorized");

    // Lockout check: count fails in last 15 min
    const since = new Date(Date.now() - LOCKOUT_MS).toISOString();
    const { data: recent } = await supabaseAdmin
      .from("admin_login_attempts")
      .select("success, attempted_at")
      .eq("user_id", userId)
      .gte("attempted_at", since)
      .order("attempted_at", { ascending: false });

    const fails = (recent ?? []).filter((r) => !r.success).length;
    if (fails >= MAX_FAILS) {
      const oldestFail = (recent ?? []).filter((r) => !r.success).slice(-1)[0];
      const unlockAt = oldestFail
        ? new Date(new Date(oldestFail.attempted_at).getTime() + LOCKOUT_MS).toISOString()
        : new Date(Date.now() + LOCKOUT_MS).toISOString();
      return { ok: false, locked: true, unlockAt, failsRemaining: 0 };
    }

    // Compare
    const passwordHash = await sha256(data.password);
    const { data: settings } = await supabaseAdmin
      .from("admin_settings")
      .select("password_hash")
      .limit(1)
      .maybeSingle();

    const success =
      !!settings?.password_hash && settings.password_hash === passwordHash;

    await supabaseAdmin
      .from("admin_login_attempts")
      .insert({ user_id: userId, success });

    if (success) {
      return { ok: true, locked: false, failsRemaining: MAX_FAILS };
    }
    return {
      ok: false,
      locked: false,
      failsRemaining: Math.max(0, MAX_FAILS - fails - 1),
    };
  });

// ---------- list login attempts (admin only) ----------
export const listLoginAttempts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data: role } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Not authorized");

    const { data } = await supabaseAdmin
      .from("admin_login_attempts")
      .select("id, user_id, success, attempted_at, ip_address")
      .order("attempted_at", { ascending: false })
      .limit(100);
    return { attempts: data ?? [] };
  });

// ---------- update admin password ----------
export const updateAdminPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { current: string; next: string }) =>
    z
      .object({
        current: z.string().min(1).max(128),
        next: z.string().min(8).max(128),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: role } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Not authorized");

    const { data: settings } = await supabaseAdmin
      .from("admin_settings")
      .select("id, password_hash")
      .limit(1)
      .maybeSingle();
    const currentHash = await sha256(data.current);
    if (!settings || settings.password_hash !== currentHash) {
      throw new Error("Current password is incorrect");
    }
    const nextHash = await sha256(data.next);
    await supabaseAdmin
      .from("admin_settings")
      .update({ password_hash: nextHash, updated_at: new Date().toISOString() })
      .eq("id", settings.id);
    return { ok: true };
  });

// ---------- list customers ----------
export const listCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data: role } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Not authorized");

    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, user_id, display_name, company, plan, role, created_at")
      .order("created_at", { ascending: false });

    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    const emailById = new Map(
      (usersData?.users ?? []).map((u) => [u.id, u.email ?? ""]),
    );
    return {
      customers: (profiles ?? []).map((p) => ({
        ...p,
        email: emailById.get(p.user_id) ?? "",
      })),
    };
  });

// ---------- delete customer ----------
export const deleteCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) =>
    z.object({ userId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: role } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Not authorized");
    await supabaseAdmin.auth.admin.deleteUser(data.userId);
    return { ok: true };
  });

// ---------- list submissions ----------
export const listSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data: role } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Not authorized");

    const [{ data: contacts }, { data: demos }, { data: subs }] = await Promise.all([
      supabaseAdmin.from("contacts").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("demo_requests").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("subscribers").select("*").order("subscribed_at", { ascending: false }),
    ]);
    return {
      contacts: contacts ?? [],
      demos: demos ?? [],
      subscribers: subs ?? [],
    };
  });

export const deleteSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { table: "contacts" | "demo_requests" | "subscribers"; id: string }) =>
    z
      .object({
        table: z.enum(["contacts", "demo_requests", "subscribers"]),
        id: z.string().uuid(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: role } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Not authorized");
    await supabaseAdmin.from(data.table).delete().eq("id", data.id);
    return { ok: true };
  });
