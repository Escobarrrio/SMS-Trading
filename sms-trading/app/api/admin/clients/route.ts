import { NextRequest } from 'next/server';
import { json, ok, fail } from '@/lib/api';
import { supabaseAdmin } from '@/lib/supabase';
import { getClientContext } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const ctx = await getClientContext(req);
    if (!ctx.isAdmin) return json(fail('forbidden', 'Admin only'), { status: 403 });

    const { data, error, count } = (await supabaseAdmin
      .from('clients')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })) as any;

    if (error) throw error;
    return json(ok({ items: data ?? [], total: count ?? 0 }));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await getClientContext(req);
    if (!ctx.isAdmin) return json(fail('forbidden', 'Admin only'), { status: 403 });

    const body = await req.json();
    const { clientId, allowance } = body;

    if (!clientId || allowance === undefined) return json(fail('validation_error', 'clientId and allowance required'), { status: 422 });

    const { data, error } = await supabaseAdmin
      .from('clients')
      .update({ allowance })
      .eq('id', clientId)
      .select('*')
      .single();

    if (error) throw error;

    // Log action
    try {
      await supabaseAdmin.rpc('log_audit_action', {
        p_admin_id: ctx.clientId,
        p_action: 'update_allowance',
        p_resource_type: 'client',
        p_resource_id: clientId,
        p_changes: JSON.stringify({ allowance }),
      });
    } catch {}

    return json(ok(data));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}
