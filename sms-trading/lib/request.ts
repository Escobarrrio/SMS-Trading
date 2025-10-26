import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export function getUserIdFromRequest(req: NextRequest): string {
  try {
    const { userId } = (auth as any)();
    if (userId) return userId;
  } catch {}
  return 'demo-user';
}
