import { NextRequest } from 'next/server';
import { json, ok, fail } from '@/lib/api';
import { supabaseAdmin } from '@/lib/supabase';
import { getClientContext } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const ctx = await getClientContext(req);
    const { data, error } = await supabaseAdmin
      .from('templates')
      .select('*')
      .eq('client_id', ctx.clientId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return json(ok(data ?? []));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getClientContext(req);
    const body = await req.json();
    const name = (body?.name || '').toString().trim();
    const text = (body?.text || '').toString();
    if (!name || !text) return json(fail('validation_error', 'name and text required'), { status: 422 });
    const { data, error } = await supabaseAdmin
      .from('templates')
      .insert({ client_id: ctx.clientId, name, text, variables: Array.from(new Set((text.match(/\{\s*([a-zA-Z0-9_]+)\s*\}/g) || []).map((m) => m.replace(/[{}\s]/g, '')))) })
      .select('*')
      .single();
    if (error) throw error;
    return json(ok(data));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}
