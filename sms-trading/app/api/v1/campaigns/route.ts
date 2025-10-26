import { NextRequest } from 'next/server';
import { json, ok, fail, getIdempotencyKey } from '@/lib/api';
import { CampaignCreateSchema } from '@/lib/schemas';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizePhone } from '@/lib/phone';
import { getClientContext } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const ctx = await getClientContext(req);
    if (!ctx.clientId) return json(ok({ items: [], meta: { total: 0 } }));
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20', 10);
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0', 10);

    const { data: campaigns, error, count } = (await supabaseAdmin
      .from('campaigns')
      .select('*', { count: 'exact' })
      .eq('client_id', ctx.clientId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)) as any;
    if (error) throw error;

    const ids = (campaigns ?? []).map((c: any) => c.id);
    let stats: Record<string, any> = {};
    if (ids.length) {
      const { data: rows } = await supabaseAdmin
        .from('campaign_messages')
        .select('campaign_id, status')
        .in('campaign_id', ids);
      stats = (rows ?? []).reduce((acc: any, r: any) => {
        acc[r.campaign_id] = acc[r.campaign_id] || { sent: 0, failed: 0, delivered: 0, queued: 0 };
        const s = r.status as string;
        if (s === 'sent') acc[r.campaign_id].sent++;
        else if (s === 'failed') acc[r.campaign_id].failed++;
        else if (s === 'delivered') acc[r.campaign_id].delivered++;
        else if (s === 'queued') acc[r.campaign_id].queued++;
        return acc;
      }, {});
    }

    const items = (campaigns ?? []).map((c: any) => ({ ...c, stats: stats[c.id] || { sent: 0, failed: 0, delivered: 0, queued: 0 } }));
    return json(ok({ items, meta: { limit, offset, total: count ?? 0 } }));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getClientContext(req);
    if (!ctx.clientId) return json(fail('unauthorized', 'Sign in required'), { status: 401 });

    const idem = getIdempotencyKey(req.headers);
    if (idem) {
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
        await supabaseAdmin.from('idempotency').insert({ key: idem, client_id: ctx.clientId });
      } catch {}
    }

    const body = await req.json();
    const parsed = CampaignCreateSchema.safeParse(body);
    if (!parsed.success) return json(fail('validation_error', 'Invalid request', parsed.error.flatten()), { status: 422 });

    const { name, message, recipients = [], tag, scheduleAt } = parsed.data as any;

    // Create campaign record
    const { data: campaign, error: cErr } = await supabaseAdmin
      .from('campaigns')
      .insert({ client_id: ctx.clientId, name, message, scheduled_for: scheduleAt ? new Date(scheduleAt) : null, created_by: ctx.supabaseUserId || null, status: scheduleAt ? 'scheduled' : 'draft' })
      .select('*')
      .single();
    if (cErr) throw cErr;

    // Resolve recipients (recipients > tag > all)
    let targets: string[] = Array.isArray(recipients) ? recipients.map(normalizePhone) : [];
    if (!targets.length && tag) {
      const { data: contacts } = await supabaseAdmin.from('contacts').select('phone').eq('client_id', ctx.clientId).eq('tag', tag);
      targets = (contacts ?? []).map((c: any) => normalizePhone(c.phone));
    }
    if (!targets.length) {
      const { data: contacts } = await supabaseAdmin.from('contacts').select('phone').eq('client_id', ctx.clientId);
      targets = (contacts ?? []).map((c: any) => normalizePhone(c.phone));
    }
    targets = Array.from(new Set(targets));

    // Suppression filtering
    const { data: suppressed } = await supabaseAdmin.from('suppression_list').select('phone').eq('client_id', ctx.clientId);
    const supSet = new Set((suppressed ?? []).map((s: any) => s.phone));
    const finalTargets = targets.filter((p) => !supSet.has(p));

    if (finalTargets.length) {
      const rows = finalTargets.map((to) => ({ campaign_id: campaign.id, to_number: to, status: 'queued' }));
      await supabaseAdmin.from('campaign_messages').insert(rows);
    }

    return json(ok({ campaignId: campaign.id, queued: finalTargets.length }));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}
