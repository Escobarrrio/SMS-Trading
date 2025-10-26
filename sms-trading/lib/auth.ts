import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from './supabase';
import { auth } from '@clerk/nextjs/server';

export type ClientContext = {
  clientId: string | null;
  isAdmin: boolean;
  clerkId?: string | null;
};

function sha256(s: string) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

export async function getClientContext(req: NextRequest): Promise<ClientContext> {
  // API key first
  const apiKey = req.headers.get('x-api-key') || req.headers.get('X-Api-Key');
  if (apiKey) {
    const hash = sha256(apiKey);
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('client_id')
      .eq('key_hash', hash)
      .maybeSingle();
    if (!error && data?.client_id) {
      return { clientId: data.client_id, isAdmin: false };
    }
  }

  // Clerk fallback
  try {
    const { userId } = (auth as any)();
    if (userId) {
      const { data, error } = await supabaseAdmin
        .from('clients')
        .select('id, is_admin')
        .eq('clerk_id', userId)
        .single();
      if (!error && data) return { clientId: data.id, isAdmin: !!data.is_admin, clerkId: userId };
    }
  } catch {}

  // Preview/demo
  return { clientId: null, isAdmin: true };
}
