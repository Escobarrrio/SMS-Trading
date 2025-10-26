import { NextRequest } from 'next/server';
import { json, ok, fail } from '@/lib/api';
import { ContactSchema, BulkContactsSchema } from '@/lib/schemas';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizePhone } from '@/lib/phone';
import { getClientContext } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const ctx = await getClientContext(req);
    const tag = req.nextUrl.searchParams.get('tag') ?? undefined;
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50', 10);
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0', 10);
    let query = supabaseAdmin
      .from('contacts')
      .select('*', { count: 'exact' })
      .eq('client_id', ctx.clientId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (tag) query = query.eq('tag', tag);
    const { data, error, count } = await query as any;
    if (error) throw error;
    return json(ok(data ?? [], { limit, offset, total: count ?? 0 }));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getClientContext(req);
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      // Bulk creation support
      if (Array.isArray(body?.contacts)) {
        const parsed = BulkContactsSchema.safeParse({ contacts: body.contacts });
        if (!parsed.success) return json(fail('validation_error', 'Invalid contacts', parsed.error.flatten()), { status: 422 });
        const rows = parsed.data.contacts.map((c) => ({ client_id: ctx.clientId, name: c.name ?? null, phone: normalizePhone(c.phone), normalized_phone: normalizePhone(c.phone), tag: c.tag ?? null }));
        const { data, error } = await supabaseAdmin.from('contacts').insert(rows).select('id, normalized_phone, tag');
        if (error) throw error;
        // map tags into contact_tags
        const tagNames = Array.from(new Set((data ?? []).map(d => d.tag).filter(Boolean) as string[]));
        for (const t of tagNames) {
          const { data: tg } = await supabaseAdmin.rpc('ensure_tag', { p_client: ctx.clientId, p_name: t });
          const tagRow = tg as any;
          const { data: fresh } = await supabaseAdmin
            .from('contacts')
            .select('id, tag')
            .eq('client_id', ctx.clientId)
            .in('id', (data ?? []).map(d => d.id));
          for (const c of fresh ?? []) {
            if (c.tag === t) { try { await supabaseAdmin.from('contact_tags').insert({ contact_id: c.id, tag_id: tagRow }); } catch {} }
          }
        }
        return json(ok({ created: data?.length ?? 0, contacts: data }));
      }

      const parsed = ContactSchema.safeParse(body);
      if (!parsed.success) return json(fail('validation_error', 'Invalid contact', parsed.error.flatten()), { status: 422 });
      const row = { client_id: ctx.clientId, name: parsed.data.name ?? null, phone: normalizePhone(parsed.data.phone), normalized_phone: normalizePhone(parsed.data.phone), tag: parsed.data.tag ?? null };
      const { data, error } = await supabaseAdmin.from('contacts').insert(row).select('id, tag').single();
      if (error) throw error;
      if (data?.tag) {
        const { data: tg } = await supabaseAdmin.rpc('ensure_tag', { p_client: ctx.clientId, p_name: data.tag });
        try { await supabaseAdmin.from('contact_tags').insert({ contact_id: data.id, tag_id: tg as any }); } catch {}
      }
      return json(ok(data));
    }

    return json(fail('unsupported_media_type', 'Use application/json'), { status: 415 });
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}
