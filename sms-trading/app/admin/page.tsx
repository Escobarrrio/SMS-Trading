import { supabaseAdmin } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase';

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Unauthorized</p>
      </div>
    );
  }

  const { data } = await supabaseAdmin
    .from('clients')
    .select('is_admin')
    .eq('supabase_user_id', user.id)
    .single();

  if (!data?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">403 – Admins only</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        <p className="text-gray-700">Coming soon: clients, credits, invoices, provider balance.</p>
      </div>
    </div>
  );
}
