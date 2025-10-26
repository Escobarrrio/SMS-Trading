import { json, ok, fail } from '@/lib/api';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Test database connection
    const { data, error } = await supabaseAdmin.from('clients').select('count(*)').limit(1);
    if (error) throw error;

    return json(ok({ status: 'ready', db: 'connected', timestamp: new Date().toISOString() }));
  } catch (e: any) {
    return json(fail('not_ready', e?.message ?? 'Database connection failed'), { status: 503 });
  }
}
