import { NextRequest } from 'next/server';
import { json, ok, fail } from '@/lib/api';
import { supabaseAdmin } from '@/lib/supabase';
import { getClientContext } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const ctx = await getClientContext(req);
    if (!ctx.clientId) return json(fail('unauthorized', 'Sign in required'), { status: 401 });

    const body = await req.json();
    const { campaignId, scheduledFor, timeWindowStart, timeWindowEnd, throttleRate } = body;

    if (!campaignId || !scheduledFor) return json(fail('validation_error', 'campaignId and scheduledFor required'), { status: 422 });

    const updates: any = {
      scheduled_for: new Date(scheduledFor).toISOString(),
      status: 'scheduled',
    };

    // Store scheduling metadata in campaign
    if (timeWindowStart !== undefined || timeWindowEnd !== undefined || throttleRate !== undefined) {
      const metadata: any = {};
      if (timeWindowStart !== undefined) metadata.timeWindowStart = timeWindowStart;
      if (timeWindowEnd !== undefined) metadata.timeWindowEnd = timeWindowEnd;
      if (throttleRate !== undefined) metadata.throttleRate = throttleRate;

      // Store as JSON if DB supports, or as text
      updates.scheduling_metadata = JSON.stringify(metadata);
    }

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .update(updates)
      .eq('id', campaignId)
      .eq('client_id', ctx.clientId)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) return json(fail('not_found', 'Campaign not found'), { status: 404 });

    return json(ok(data));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}
