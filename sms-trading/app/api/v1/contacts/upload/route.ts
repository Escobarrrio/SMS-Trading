import { NextRequest } from 'next/server';
import { json, ok, fail } from '@/lib/api';
import { normalizePhone } from '@/lib/phone';
import { supabaseAdmin } from '@/lib/supabase';
import { getClientContext } from '@/lib/auth';

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else cur += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(cur); cur = ''; }
      else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
      else if (c === '\r') { /* ignore */ }
      else cur += c;
    }
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.length && r.some(x => x.trim() !== ''));
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    const commit = (form.get('commit') || 'false').toString() === 'true';
    const hasHeader = (form.get('hasHeader') || 'true').toString() === 'true';
    const nameCol = (form.get('nameColumn') || 'name').toString().toLowerCase();
    const phoneCol = (form.get('phoneColumn') || 'phone').toString().toLowerCase();
    const tagCol = (form.get('tagColumn') || 'tag').toString().toLowerCase();

    if (!(file instanceof File)) return json(fail('bad_request', 'file is required'), { status: 400 });
    const text = await file.text();
    const rows = parseCSV(text);
    if (!rows.length) return json(fail('empty_file', 'No rows found'), { status: 422 });

    const header = hasHeader ? rows[0].map(h => h.trim().toLowerCase()) : [];
    const dataRows = hasHeader ? rows.slice(1) : rows;

    const idx = (wanted: string) => {
      const candidates = [wanted, wanted.replace(/\s+/g, ''), wanted.replace('-', '')];
      for (const c of candidates) {
        const i = header.indexOf(c);
        if (i >= 0) return i;
      }
      // default positions if no header
      if (!hasHeader) {
        if (wanted === 'phone') return 0;
        if (wanted === 'name') return 1;
        if (wanted === 'tag') return 2;
      }
      return -1;
    };

    const nameIdx = idx(nameCol);
    const phoneIdx = idx(phoneCol);
    const tagIdx = idx(tagCol);
    if (phoneIdx < 0) return json(fail('mapping_error', 'Could not locate phone column'), { status: 422 });

    const seen = new Set<string>();
    const valid: { name: string | null; phone: string; tag: string | null }[] = [];
    const invalid: { row: number; value: string; reason: string }[] = [];

    dataRows.forEach((r, i) => {
      const raw = (r[phoneIdx] || '').trim();
      if (!raw) { invalid.push({ row: i + 1, value: '', reason: 'empty phone' }); return; }
      const phone = normalizePhone(raw);
      if (!/^\+\d{9,15}$/.test(phone)) { invalid.push({ row: i + 1, value: raw, reason: 'invalid E.164' }); return; }
      if (seen.has(phone)) { invalid.push({ row: i + 1, value: raw, reason: 'duplicate in file' }); return; }
      seen.add(phone);
      const name = nameIdx >= 0 ? (r[nameIdx] || '').trim() || null : null;
      const tag = tagIdx >= 0 ? (r[tagIdx] || '').trim() || null : null;
      valid.push({ name, phone, tag });
    });

    if (!commit) {
      return json(ok({ preview: true, total: rows.length, parsed: valid.length, invalid, sample: valid.slice(0, 5) }));
    }

    const ctx = await getClientContext(req);
    const rowsToInsert = valid.map(v => ({ client_id: ctx.clientId, name: v.name, phone: v.phone, normalized_phone: v.phone, tag: v.tag }));
    const { data, error } = await supabaseAdmin.from('contacts').insert(rowsToInsert).select('id');
    if (error) throw error;
    
    // Map tags into contact_tags and ensure tags table entries exist (best-effort)
    const tagNames = Array.from(new Set(valid.map(v => v.tag).filter(Boolean) as string[]));
    for (const t of tagNames) {
      let tagId: any = null;
      try {
        const { data: tg } = await supabaseAdmin.rpc('ensure_tag', { p_client: ctx.clientId, p_name: t as any });
        tagId = tg as any;
      } catch {}
      if (tagId) {
        const { data: fresh } = await supabaseAdmin.from('contacts').select('id, tag').eq('client_id', ctx.clientId).in('id', (data ?? []).map((d: any) => d.id));
        for (const c of fresh ?? []) {
          if (c.tag === t) { try { await supabaseAdmin.from('contact_tags').insert({ contact_id: c.id, tag_id: tagId }); } catch {} }
        }
      }
    }

    return json(ok({ created: data?.length ?? 0, invalid }));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}
