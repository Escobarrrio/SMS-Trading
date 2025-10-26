import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from './supabase';

export type ClientContext = {
  clientId: string | null;
  isAdmin: boolean;
  supabaseUserId?: string | null;
};

function sha256(s: string) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

/**
 * Extract JWT token from Authorization header
 */
function getJwtFromHeader(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

/**
 * Get client context from request (API key or Supabase Auth session)
 */
export async function getClientContext(req: NextRequest): Promise<ClientContext> {
  // 1. Check API key first (for API key authentication)
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

  // 2. Check Supabase Auth JWT token (for session-based authentication)
  const jwt = getJwtFromHeader(req);
  if (jwt) {
    try {
      const { data, error } = await supabaseAdmin.auth.getUser(jwt);
      if (!error && data?.user?.id) {
        // Look up client by Supabase user ID
        const { data: clientData, error: clientError } = await supabaseAdmin
          .from('clients')
          .select('id, is_admin')
          .eq('supabase_user_id', data.user.id)
          .single();
        if (!clientError && clientData) {
          return { clientId: clientData.id, isAdmin: !!clientData.is_admin, supabaseUserId: data.user.id };
        }
      }
    } catch {}
  }

  // 3. Preview/demo mode
  return { clientId: null, isAdmin: true };
}
