import { NextRequest } from 'next/server';
import { json, ok, fail } from '@/lib/api';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const status = (body.status || body.SMSStatus || '').toString().toLowerCase();
    const messageId = (body.messageId || body.id || '').toString();
    const from = (body.from || body.msisdn || '').toString();
    const text = (body.text || body.message || '').toString();

    if (messageId && status) {
      const update: any = { status: status.includes('deliver') ? 'delivered' : status.includes('fail') ? 'failed' : status };
      if (update.status === 'delivered') update.delivered_at = new Date().toISOString();
      await supabaseAdmin.from('campaign_messages').update(update).eq('provider_id', messageId);
    }

    if (from && /^\+\d{9,15}$/.test(from) && /^\s*(stop|unsubscribe)\s*$/i.test(text)) {
      const { data: tx } = await supabaseAdmin
        .from('sms_transactions')
        .select('client_id')
        .eq('to_number', from)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (tx?.client_id) {
        try { await supabaseAdmin.from('suppression_list').insert({ client_id: tx.client_id, phone: from, reason: 'STOP' }); } catch {}
      }
    }

    return json(ok({ received: true }));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}
