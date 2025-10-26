import { json, ok, fail } from '@/lib/api';
import { supabaseAdmin } from '@/lib/supabase';
import { sendWithFallback } from '@/lib/providers';

// Cron endpoint to dispatch queued campaign messages for due campaigns.
export async function GET() {
  try {
    const nowIso = new Date().toISOString();

    // Fetch due campaigns (scheduled_for <= now or null) that still have queued messages
    const { data: dueCampaigns, error: cErr } = await supabaseAdmin
      .from('campaigns')
      .select('id, client_id, message, scheduled_for, status')
      .or(`scheduled_for.is.null,scheduled_for.lte.${nowIso}`)
      .in('status', ['draft', 'scheduled', 'sending']) as any;
    if (cErr) throw cErr;

    const batchSize = 100; // throttle per run
    const results: any[] = [];

    for (const c of dueCampaigns ?? []) {
      // Fetch a batch of queued messages for this campaign
      const { data: msgs, error: mErr } = await supabaseAdmin
        .from('campaign_messages')
        .select('id, to_number, status')
        .eq('campaign_id', c.id)
        .eq('status', 'queued')
        .limit(batchSize);
      if (mErr) throw mErr;

      if (!msgs?.length) {
        // No more queued; mark campaign as sent if not already
        await supabaseAdmin.from('campaigns').update({ dispatched_at: new Date().toISOString(), status: 'sent' }).eq('id', c.id);
        continue;
      }

      // Mark campaign as sending
      await supabaseAdmin.from('campaigns').update({ status: 'sending' }).eq('id', c.id);

      let sent = 0;
      for (const m of msgs) {
        try {
          const res = await sendWithFallback({ to: m.to_number, body: c.message });
          await supabaseAdmin
            .from('campaign_messages')
            .update({ status: 'sent', provider_id: res.id })
            .eq('id', m.id);
          await supabaseAdmin.from('sms_transactions').insert({ client_id: c.client_id, to_number: m.to_number, message: c.message, status: 'sent', cost: 0.68 });
          sent++;
        } catch (e: any) {
          await supabaseAdmin
            .from('campaign_messages')
            .update({ status: 'failed', error: e?.message ?? 'Failed' })
            .eq('id', m.id);
        }
      }

      results.push({ campaignId: c.id, processed: msgs.length, sent });
    }

    return json(ok({ processed: results.length, results }));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}
