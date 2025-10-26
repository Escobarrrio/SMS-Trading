import { NextRequest } from 'next/server';
import { json, ok, fail } from '@/lib/api';
import { CampaignCreateSchema } from '@/lib/schemas';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizePhone } from '@/lib/phone';
import { sendSMS } from '@/lib/bulksms';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .select('*, campaign_messages(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return json(ok(data ?? []));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CampaignCreateSchema.safeParse(body);
    if (!parsed.success) return json(fail('validation_error', 'Invalid request', parsed.error.flatten()), { status: 422 });

    const { name, message, recipients = [], tag, scheduleAt } = parsed.data;

    // If tag provided, fetch contacts by tag
    let targets = recipients.map(normalizePhone);
    if (tag) {
      const { data: contacts, error } = await supabaseAdmin.from('contacts').select('phone').eq('tag', tag);
      if (error) throw error;
      targets = [...targets, ...(contacts?.map((c) => normalizePhone(c.phone)) ?? [])];
    }
    targets = Array.from(new Set(targets));

    // Create campaign record
    const { data: campaign, error: cErr } = await supabaseAdmin
      .from('campaigns')
      .insert({ name, message, scheduled_for: scheduleAt ? new Date(scheduleAt) : null })
      .select('*')
      .single();
    if (cErr) throw cErr;

    // Send immediately if not scheduled
    const results: any[] = [];
    if (!scheduleAt && targets.length) {
      for (const to of targets) {
        try {
          const res = await sendSMS({ to, body: message });
          results.push({ to, status: 'sent', providerId: res.id });
          await supabaseAdmin.from('campaign_messages').insert({ campaign_id: campaign.id, to_number: to, status: 'sent' });
        } catch (e: any) {
          results.push({ to, status: 'failed', error: e?.message });
          await supabaseAdmin.from('campaign_messages').insert({ campaign_id: campaign.id, to_number: to, status: 'failed' });
        }
      }
    }

    return json(ok({ campaign, results }));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}
