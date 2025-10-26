import { NextRequest } from 'next/server';
import { json, ok, fail } from '@/lib/api';
import { supabaseAdmin } from '@/lib/supabase';
import { getClientContext } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const ctx = await getClientContext(req);
    const { data, error } = await supabaseAdmin.from('tags').select('*').eq('client_id', ctx.clientId).order('name');
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
    if (!name) return json(fail('validation_error', 'name required'), { status: 422 });
    const { data: id } = await supabaseAdmin.rpc('ensure_tag', { p_client: ctx.clientId, p_name: name });
    const { data } = await supabaseAdmin.from('tags').select('*').eq('id', id as any).single();
    return json(ok(data));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}
