import { NextRequest } from 'next/server';
import { json, ok, fail } from '@/lib/api';
import { supabaseAdmin } from '@/lib/supabase';
import { getClientContext } from '@/lib/auth';
import { sendWithFallback } from '@/lib/providers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  try {
    const ctx = await getClientContext(req);
    if (!ctx.clientId) return json(fail('unauthorized', 'Sign in required'), { status: 401 });

    const { id } = p;

    const { data: campaign, error: cErr } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('client_id', ctx.clientId)
      .single();

    if (cErr) throw cErr;
    if (!campaign) return json(fail('not_found', 'Campaign not found'), { status: 404 });

    // Get message stats
    const { data: messages } = await supabaseAdmin.from('campaign_messages').select('status, cost, delivered_at').eq('campaign_id', id);

    const stats = (messages ?? []).reduce(
      (acc: any, m: any) => {
        acc.total++;
        if (m.status === 'sent') acc.sent++;
        else if (m.status === 'delivered') acc.delivered++;
        else if (m.status === 'failed') acc.failed++;
        else if (m.status === 'queued') acc.queued++;
        acc.totalCost += m.cost ?? 0;
        return acc;
      },
      { total: 0, sent: 0, delivered: 0, failed: 0, queued: 0, totalCost: 0 }
    );

    return json(ok({ ...campaign, stats, failedMessages: messages?.filter((m: any) => m.status === 'failed') ?? [] }));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  try {
    const ctx = await getClientContext(req);
    if (!ctx.clientId) return json(fail('unauthorized', 'Sign in required'), { status: 401 });

    const { id } = p;
    const body = await req.json();
    const { action } = body;

    if (action === 'resend-failed') {
      // Fetch failed messages for this campaign
      const { data: failed } = await supabaseAdmin
        .from('campaign_messages')
        .select('id, to_number')
        .eq('campaign_id', id)
        .eq('status', 'failed');

      if (!failed?.length) return json(ok({ resent: 0 }));

      // Get campaign message
      const { data: campaign } = await supabaseAdmin.from('campaigns').select('message').eq('id', id).single();
      if (!campaign) return json(fail('not_found', 'Campaign not found'), { status: 404 });

      let resent = 0;
      for (const m of failed) {
        try {
          const res = await sendWithFallback({ to: m.to_number, body: campaign.message });
          await supabaseAdmin.from('campaign_messages').update({ status: 'sent', provider_id: res.id }).eq('id', m.id);
          resent++;
        } catch (e: any) {
          await supabaseAdmin.from('campaign_messages').update({ status: 'failed', error: e?.message }).eq('id', m.id);
        }
      }

      return json(ok({ resent }));
    }

    return json(fail('invalid_action', 'Unknown action'), { status: 400 });
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}
