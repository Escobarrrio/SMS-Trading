import { NextRequest } from 'next/server';
import { json, ok, fail } from '@/lib/api';
import { supabaseAdmin } from '@/lib/supabase';
import { getClientContext } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const ctx = await getClientContext(req);
    if (!ctx.isAdmin) return json(fail('forbidden', 'Admin only'), { status: 403 });

    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50', 10);
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0', 10);
    const adminId = req.nextUrl.searchParams.get('adminId') || undefined;

    let q = supabaseAdmin.from('audit_logs').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    if (adminId) q = (q as any).eq('admin_id', adminId);

    const { data, error, count } = (await q) as any;

    if (error) throw error;
    return json(ok({ items: data ?? [], total: count ?? 0, limit, offset }));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}
