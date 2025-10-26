import { NextRequest } from 'next/server';
import { json, ok, fail } from '@/lib/api';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizePhone } from '@/lib/phone';
import { sendSMS } from '@/lib/bulksms';

// Cron endpoint to dispatch scheduled campaigns.
export async function GET() {
  try {
    const now = new Date().toISOString();
    const { data: due, error } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .lte('scheduled_for', now)
      .is('dispatched_at', null)
      .limit(10);
    if (error) throw error;

    const results: any[] = [];

    for (const c of due ?? []) {
      // get recipients by tag if provided via tags on contacts
      const { data: recipients } = await supabaseAdmin
        .from('contacts')
        .select('phone')
        .eq('client_id', c.client_id)
        .maybeSingle();

      const phones = (recipients ? [recipients] : []).flat().map((r: any) => normalizePhone(r.phone));
      const unique = Array.from(new Set(phones));

      for (const to of unique) {
        try {
          const res = await sendSMS({ to, body: c.message });
          await supabaseAdmin.from('campaign_messages').insert({ campaign_id: c.id, to_number: to, status: 'sent', provider_id: res.id });
        } catch (e: any) {
          await supabaseAdmin.from('campaign_messages').insert({ campaign_id: c.id, to_number: to, status: 'failed', error: e?.message });
        }
      }

      await supabaseAdmin
        .from('campaigns')
        .update({ dispatched_at: new Date(), status: 'sent' })
        .eq('id', c.id);

      results.push({ id: c.id, sent: unique.length });
    }

    return json(ok({ processed: results.length, results }));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}
