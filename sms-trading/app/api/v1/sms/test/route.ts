import { NextRequest } from 'next/server';
import { json, ok, fail } from '@/lib/api';
import { sendWithFallback } from '@/lib/providers';
import { getClientContext } from '@/lib/auth';
import { compileTemplate } from '@/lib/templates';

export async function POST(req: NextRequest) {
  try {
    const ctx = await getClientContext(req);
    if (!ctx.clientId) return json(fail('unauthorized', 'Sign in required'), { status: 401 });

    const body = await req.json();
    const { message, phone } = body;

    if (!message || !phone) return json(fail('validation_error', 'message and phone required'), { status: 422 });

    const res = await sendWithFallback({ to: phone, body: message });
    return json(ok({ sent: true, providerId: res.id, status: res.status }));
  } catch (e: any) {
    return json(fail('server_error', e?.message ?? 'Failed to send test'), { status: 500 });
  }
}
