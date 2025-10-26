import { NextRequest } from 'next/server';
import { json, ok, fail } from '@/lib/api';
import { SendSMSSchema } from '@/lib/schemas';
import { sendSMS } from '@/lib/bulksms';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizePhone } from '@/lib/phone';

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

    const results: any[] = [];

    for (const phone of targets) {
      try {
        const res = await sendSMS({ to: phone, body: message });
        results.push({ to: phone, status: 'sent', providerId: res.id, providerStatus: res.status });
        // Log
        try {
          await supabaseAdmin.from('sms_transactions').insert({
            client_id: null,
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

    return json(ok({ count: results.length, results, campaignName: campaignName ?? null }));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}
