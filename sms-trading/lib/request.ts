import { NextRequest } from 'next/server';
import { getClientContext } from './auth';

export async function getUserIdFromRequest(req: NextRequest): Promise<string> {
  try {
    const ctx = await getClientContext(req);
    if (ctx.supabaseUserId) return ctx.supabaseUserId;
  } catch {}
  return 'demo-user';
}
