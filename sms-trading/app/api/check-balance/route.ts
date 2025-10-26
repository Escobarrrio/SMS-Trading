import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getClientContext } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const ctx = await getClientContext(request);
    if (!ctx.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .select('used, allowance, plan')
      .eq('id', ctx.clientId)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({
      used: client.used,
      allowance: client.allowance,
      remaining: client.allowance - client.used,
      plan: client.plan,
    });
  } catch (error) {
    console.error('Check Balance Error:', error);
    return NextResponse.json(
      { error: 'Failed to check balance' },
      { status: 500 }
    );
  }
}
