import { NextRequest } from 'next/server';
import { json, ok, fail, getIdempotencyKey } from '@/lib/api';
import { SendSMSSchema } from '@/lib/schemas';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizePhone } from '@/lib/phone';
import { getClientContext } from '@/lib/auth';
import { sendWithFallback } from '@/lib/providers';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SendSMSSchema.safeParse(body);
    if (!parsed.success) {
      return json(fail('validation_error', 'Invalid request', parsed.error.flatten()), { status: 422 });
    }

    const { to, recipients, message, campaignName } = parsed.data;
    const targets = (recipients ?? (to ? [to] : [])).map(normalizePhone);
    if (!targets.length) {
      return json(fail('no_recipients', 'Provide `to` or `recipients`'), { status: 422 });
    }

    const ctx = await getClientContext(req);

    // Quota check
    if (ctx.clientId) {
      const { data: client } = await supabaseAdmin
        .from('clients')
        .select('id, used, allowance, plan')
        .eq('id', ctx.clientId)
        .maybeSingle();
      if (client && client.used + targets.length > client.allowance) {
        return json(fail('quota_exceeded', 'Monthly quota exceeded'), { status: 403 });
      }

      // Rate limit per-minute by plan
      const rl = await checkRateLimit(ctx.clientId, client?.plan ?? 'starter');
      if (!rl.allowed) {
        return json(fail('rate_limited', 'Too many requests'), {
          status: 429,
          headers: { 'Retry-After': rl.retryAfterSeconds.toString() },
        } as any);
      }
    }

    // Idempotency (24h window)
    const idem = getIdempotencyKey(req.headers);
    if (idem && ctx.clientId) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: existing } = await supabaseAdmin
        .from('idempotency')
        .select('id')
        .eq('key', idem)
        .eq('client_id', ctx.clientId)
        .gte('created_at', since)
        .maybeSingle();
      if (existing) return json(ok({ idempotent: true }));
      try {
        await supabaseAdmin
          .from('idempotency')
          .insert({ key: idem, client_id: ctx.clientId });
      } catch {}
    }

    // Suppression filtering
    let filtered = targets;
    if (ctx.clientId) {
      const { data: suppressed } = await supabaseAdmin
        .from('suppression_list')
        .select('phone')
        .eq('client_id', ctx.clientId);
      const supSet = new Set((suppressed ?? []).map((s: any) => s.phone));
      filtered = targets.filter((t) => !supSet.has(t));
    }

    const results: any[] = [];
    const skipped: string[] = targets.filter((t) => !(filtered as string[]).includes(t));

    for (const phone of filtered) {
      try {
        const res = await sendWithFallback({ to: phone, body: message });
        results.push({ to: phone, status: 'sent', providerId: res.id, providerStatus: res.status, provider: res.provider });
        // Log
        try {
          await supabaseAdmin.from('sms_transactions').insert({
            client_id: ctx.clientId,
            to_number: phone,
            message,
            status: res.status ?? 'sent',
            cost: 0.68,
          });
        } catch {}
      } catch (e: any) {
        results.push({ to: phone, status: 'failed', error: e?.message ?? 'Failed' });
      }
    }

    // Update quota
    if (ctx.clientId) {
      try {
        await supabaseAdmin.rpc('increment_usage', { p_client_id: ctx.clientId, p_delta: results.filter((r) => r.status === 'sent').length });
      } catch {}
    }

    return json(ok({ count: results.length, results, skipped, campaignName: campaignName ?? null }));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}
