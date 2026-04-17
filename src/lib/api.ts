import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { OrderStatus, Json } from "@/integrations/supabase/types";

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    items: Json;
    total_amount: number;
    currency?: string;
    shipping_address?: Json;
    payment_method?: string;
  }) =>
    z.object({
      items: z.any(),
      total_amount: z.number().positive(),
      currency: z.string().default("USD"),
      shipping_address: z.any().optional(),
      payment_method: z.string().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        items: data.items,
        total_amount: data.total_amount,
        currency: data.currency,
        shipping_address: data.shipping_address,
        payment_method: data.payment_method,
        status: "pending",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { order };
  });

export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    return { orders: orders ?? [] };
  });

export const getOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", userId)
      .single();
    if (!order) throw new Error("Order not found");
    return { order };
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: OrderStatus }) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
    }).parse(d),
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
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { order };
  });

export const trackEvent = createServerFn({ method: "POST" })
  .inputValidator((d: {
    event_type: string;
    properties?: Json;
    session_id?: string;
  }) =>
    z.object({
      event_type: z.string().min(1),
      properties: z.any().optional(),
      session_id: z.string().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const userId = context.userId ?? null;
    const { data: event, error } = await supabaseAdmin
      .from("analytics_events")
      .insert({
        event_type: data.event_type,
        user_id: userId,
        session_id: data.session_id ?? null,
        properties: data.properties ?? {},
        ip_address: context.request?.headers?.get("x-forwarded-for") ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { event };
  });

export const getAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d?: { days?: number; event_type?: string }) =>
    z.object({
      days: z.coerce.number().min(1).max(90).default(30),
      event_type: z.string().optional(),
    }).optional().parse(d),
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

    const days = data?.days ?? 30;
    const eventType = data?.event_type;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    let query = supabaseAdmin
      .from("analytics_events")
      .select("event_type, created_at")
      .gte("created_at", since);

    if (eventType) {
      query = query.eq("event_type", eventType);
    }

    const { data: events } = await query;

    const byType: Record<string, number> = {};
    const byDay: Record<string, number> = {};
    for (const e of events ?? []) {
      byType[e.event_type] = (byType[e.event_type] ?? 0) + 1;
      const day = e.created_at.split("T")[0];
      byDay[day] = (byDay[day] ?? 0) + 1;
    }

    return {
      total: events?.length ?? 0,
      byType,
      byDay,
      periodDays: days,
    };
  });