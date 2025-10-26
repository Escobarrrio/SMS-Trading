import { NextRequest } from 'next/server';
import { json, ok, fail } from '@/lib/api';
import { supabaseAdmin } from '@/lib/supabase';
import { getClientContext } from '@/lib/auth';

function toCsv(rows: any[]) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => {
    if (v == null) return '';
    const s = String(v);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const lines = [headers.join(',')];
  for (const r of rows) lines.push(headers.map((h) => esc((r as any)[h])).join(','));
  return lines.join('\n');
}

export async function GET(req: NextRequest) {
  try {
    const ctx = await getClientContext(req);
    if (!ctx.clientId) return json(fail('unauthorized', 'Sign in required'), { status: 401 });

    const format = (req.nextUrl.searchParams.get('format') || 'csv').toLowerCase();
    const tag = req.nextUrl.searchParams.get('tag') || undefined;

    let q = supabaseAdmin.from('contacts').select('name, phone, tag, created_at').eq('client_id', ctx.clientId).order('created_at', { ascending: false });
    if (tag) q = (q as any).eq('tag', tag);
    const { data, error } = await q as any;
    if (error) throw error;

    if (format === 'json') return json(ok(data ?? []));

    const csv = toCsv(data ?? []);
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="contacts.csv"',
      },
    });
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}
