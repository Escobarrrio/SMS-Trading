import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { json, ok, fail } from '@/lib/api';
import { supabaseAdmin } from '@/lib/supabase';
import { getClientContext } from '@/lib/auth';

function randomKey(): string {
  return 'sk_' + crypto.randomBytes(24).toString('hex');
}
function sha256(s: string) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

export async function GET(req: NextRequest) {
  try {
    const ctx = await getClientContext(req);
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('id, created_at, last_used_at')
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
    const key = randomKey();
    const hash = sha256(key);
    const { error } = await supabaseAdmin.from('api_keys').insert({ client_id: ctx.clientId, key_hash: hash });
    if (error) throw error;
    return json(ok({ apiKey: key }));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await getClientContext(req);
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return json(fail('validation_error', 'id required'), { status: 422 });
    const { error } = await supabaseAdmin.from('api_keys').delete().eq('id', id).eq('client_id', ctx.clientId);
    if (error) throw error;
    return json(ok({ revoked: true }));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}
