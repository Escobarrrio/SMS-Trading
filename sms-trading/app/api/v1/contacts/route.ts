import { NextRequest } from 'next/server';
import { json, ok, fail } from '@/lib/api';
import { ContactSchema, BulkContactsSchema } from '@/lib/schemas';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizePhone } from '@/lib/phone';

export async function GET(req: NextRequest) {
  try {
    const tag = req.nextUrl.searchParams.get('tag') ?? undefined;
    let query = supabaseAdmin.from('contacts').select('*').order('created_at', { ascending: false });
    if (tag) query = query.eq('tag', tag);
    const { data, error } = await query;
    if (error) throw error;
    return json(ok(data ?? []));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      // Bulk creation support
      if (Array.isArray(body?.contacts)) {
        const parsed = BulkContactsSchema.safeParse({ contacts: body.contacts });
        if (!parsed.success) return json(fail('validation_error', 'Invalid contacts', parsed.error.flatten()), { status: 422 });
        const rows = parsed.data.contacts.map((c) => ({ name: c.name ?? null, phone: normalizePhone(c.phone), tag: c.tag ?? null }));
        const { data, error } = await supabaseAdmin.from('contacts').insert(rows).select('*');
        if (error) throw error;
        return json(ok({ created: data?.length ?? 0, contacts: data }));
      }

      const parsed = ContactSchema.safeParse(body);
      if (!parsed.success) return json(fail('validation_error', 'Invalid contact', parsed.error.flatten()), { status: 422 });
      const row = { name: parsed.data.name ?? null, phone: normalizePhone(parsed.data.phone), tag: parsed.data.tag ?? null };
      const { data, error } = await supabaseAdmin.from('contacts').insert(row).select('*').single();
      if (error) throw error;
      return json(ok(data));
    }

    return json(fail('unsupported_media_type', 'Use application/json'), { status: 415 });
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}
