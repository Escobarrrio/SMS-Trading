import { NextRequest } from 'next/server';
import { json, ok, fail } from '@/lib/api';
import { supabaseAdmin } from '@/lib/supabase';
import { getClientContext } from '@/lib/auth';
import { normalizePhone } from '@/lib/phone';
import { compileTemplate } from '@/lib/templates';

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
        } else inQuotes = false;
      } else cur += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') {
        row.push(cur);
        cur = '';
      } else if (c === '\n') {
        row.push(cur);
        rows.push(row);
        row = [];
        cur = '';
      } else if (c === '\r') {
      } else cur += c;
    }
  }
  if (cur.length || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows.filter((r) => r.length && r.some((x) => x.trim() !== ''));
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    const commit = (form.get('commit') || 'false').toString() === 'true';
    const message = (form.get('message') || '').toString();

    if (!(file instanceof File)) return json(fail('bad_request', 'file required'), { status: 400 });
    if (!message) return json(fail('validation_error', 'message required'), { status: 422 });

    const text = await file.text();
    const rows = parseCSV(text);
    if (!rows.length) return json(fail('empty_file', 'No rows'), { status: 422 });

    const header = rows[0].map((h) => h.trim().toLowerCase());
    const dataRows = rows.slice(1);

    const phoneIdx = header.indexOf('phone');
    if (phoneIdx < 0) return json(fail('mapping_error', 'No phone column'), { status: 422 });

    const seen = new Set<string>();
    const recipients: Array<{ phone: string; mergeFields: Record<string, string> }> = [];
    const invalid: any[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const r = dataRows[i];
      const raw = (r[phoneIdx] || '').trim();
      if (!raw) {
        invalid.push({ row: i + 1, reason: 'empty phone' });
        continue;
      }

      const phone = normalizePhone(raw);
      if (!/^\+\d{9,15}$/.test(phone)) {
        invalid.push({ row: i + 1, reason: 'invalid E.164', value: raw });
        continue;
      }

      if (seen.has(phone)) {
        invalid.push({ row: i + 1, reason: 'duplicate in file', value: raw });
        continue;
      }

      seen.add(phone);

      // Extract merge fields (all columns except phone)
      const mergeFields: Record<string, string> = {};
      for (let j = 0; j < header.length; j++) {
        if (j !== phoneIdx) mergeFields[header[j]] = (r[j] || '').trim();
      }

      recipients.push({ phone, mergeFields });
    }

    if (!commit) {
      // Preview: check template compilation
      const sample = recipients.slice(0, 3);
      const previews = sample.map((r) => {
        const compiled = compileTemplate(message, r.mergeFields);
        return { phone: r.phone, message: compiled.text, missing: compiled.missing };
      });

      return json(ok({ preview: true, total: recipients.length, invalid, samples: previews }));
    }

    // Commit: send all
    const ctx = await getClientContext(req);
    if (!ctx.clientId) return json(fail('unauthorized', 'Sign in required'), { status: 401 });

    // Check suppression
    const { data: suppressed } = await supabaseAdmin.from('suppression_list').select('phone').eq('client_id', ctx.clientId);
    const supSet = new Set((suppressed ?? []).map((s: any) => s.phone));

    const { sendWithFallback } = await import('@/lib/providers');
    let sent = 0;
    let failed = 0;

    for (const r of recipients) {
      if (supSet.has(r.phone)) {
        failed++;
        continue;
      }

      try {
        const compiled = compileTemplate(message, r.mergeFields);
        const res = await sendWithFallback({ to: r.phone, body: compiled.text });
        await supabaseAdmin.from('sms_transactions').insert({
          client_id: ctx.clientId,
          to_number: r.phone,
          message: compiled.text,
          status: res.status ?? 'sent',
          cost: 0.68,
        });
        sent++;
      } catch (e: any) {
        await supabaseAdmin.from('sms_transactions').insert({
          client_id: ctx.clientId,
          to_number: r.phone,
          message,
          status: 'failed',
          cost: 0,
        });
        failed++;
      }
    }

    // Update usage
    try {
      await supabaseAdmin.rpc('increment_usage', { p_client_id: ctx.clientId, p_delta: sent });
    } catch {}

    return json(ok({ sent, failed, invalid }));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Unexpected error'), { status: 500 });
  }
}
