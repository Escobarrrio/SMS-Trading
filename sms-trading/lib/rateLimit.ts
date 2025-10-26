import { supabaseAdmin } from '@/lib/supabase';

const PLAN_RATES: Record<string, number> = {
  starter: 30,
  business: 120,
  pro: 300,
};

export async function checkRateLimit(clientId: string, plan: string) {
  const perMinute = PLAN_RATES[plan] ?? PLAN_RATES.starter;
  const since = new Date(Date.now() - 60 * 1000).toISOString();
  const { count } = (await supabaseAdmin
    .from('sms_transactions')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .gte('created_at', since)) as any;
  const allowed = (count ?? 0) < perMinute;
  const retryAfterSeconds = allowed ? 0 : 60;
  return { allowed, retryAfterSeconds };
}
