import { NextRequest } from 'next/server';
import { json, ok, fail } from '@/lib/api';
import { supabaseAdmin } from '@/lib/supabase';

// BulkSMS Webhook (DLR + inbound STOP)
// Accepts JSON or form-data. We'll detect fields defensively.
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let body: any = {};
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      form.forEach((v, k) => (body[k] = v));
    }

    const type = (body.type || body.event || '').toString().toLowerCase();
    const messageId = (body.messageId || body.id || body.provider_id || '').toString();
    const to = (body.msisdn || body.to || body.recipient || '').toString();
    const status = (body.status || body.dlrStatus || '').toString().toLowerCase();
    const text = (body.text || body.message || '').toString();

    // Delivery report
    if (status) {
      await supabaseAdmin
        .from('campaign_messages')
        .update({ status: status === 'delivered' ? 'delivered' : status, delivered_at: status === 'delivered' ? new Date() : null })
        .eq('provider_id', messageId);
      await supabaseAdmin
        .from('sms_transactions')
        .update({ status: status })
        .eq('to_number', to)
        .eq('message', text)
        .order('created_at', { ascending: false });
    }

    // Inbound STOP handling
    if (/stop|unsubscribe/i.test(text)) {
      const phone = to;
      // Find client by last message to this number
      const { data: lastTx } = await supabaseAdmin
        .from('sms_transactions')
        .select('client_id')
        .eq('to_number', phone)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (lastTx?.client_id) {
        await supabaseAdmin.from('suppression_list').insert({ client_id: lastTx.client_id, phone, reason: 'stop' }).catch(() => {});
      }
    }

    return json(ok({ received: true }));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}
