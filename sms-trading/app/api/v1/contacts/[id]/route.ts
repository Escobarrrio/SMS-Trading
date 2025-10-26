import { NextRequest } from 'next/server';
import { json, ok, fail } from '@/lib/api';
import { supabaseAdmin } from '@/lib/supabase';
import { getClientContext } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getClientContext(req);
    if (!ctx.clientId) return json(fail('unauthorized', 'Sign in required'), { status: 401 });

    const p = await params;
    const { id } = p;
    const body = await req.json();
    const { tag, name } = body;

    // Update contact
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (tag !== undefined) {
      updates.tag = tag;
      // Ensure tag exists and create contact_tag mapping
      if (tag) {
        try {
          const { data: tagId } = await supabaseAdmin.rpc('ensure_tag', { p_client: ctx.clientId, p_name: tag });
          // Remove old tag mapping if exists
          await supabaseAdmin.from('contact_tags').delete().eq('contact_id', id);
          // Add new mapping
          if (tagId) await supabaseAdmin.from('contact_tags').insert({ contact_id: id, tag_id: tagId as any });
        } catch {}
      }
    }

    const { data, error } = await supabaseAdmin
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .eq('client_id', ctx.clientId)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) return json(fail('not_found', 'Contact not found'), { status: 404 });

    return json(ok(data));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getClientContext(req);
    if (!ctx.clientId) return json(fail('unauthorized', 'Sign in required'), { status: 401 });

    const p = await params;
    const { id } = p;
    const { error } = await supabaseAdmin.from('contacts').delete().eq('id', id).eq('client_id', ctx.clientId);

    if (error) throw error;
    return json(ok({ deleted: true }));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}
