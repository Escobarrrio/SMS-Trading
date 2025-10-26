// Supabase authentication configuration
// - Authentication: Email + Password
// - Redirects:
//   - Development: http://localhost:3000/dashboard
//   - Production: https://your-domain.com/dashboard
// - After sign-up: /dashboard (via email confirmation)
// - After sign-in: /dashboard

export const supabaseAuthConfig = {
  // Supabase Auth automatically handles:
  // - Email/password authentication
  // - Session management via cookies
  // - User metadata stored in auth.users table
  redirects: {
    development: 'http://localhost:3000/dashboard',
    production: process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com/dashboard',
  },
};

// Helper to update user metadata with role
export async function setUserRole(userId: string, isAdmin: boolean) {
  // User metadata can be updated via:
  // 1. Direct Supabase Auth API call
  // 2. By updating the clients table with is_admin flag
  // Example:
  // const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
  //   user_metadata: { isAdmin }
  // });
}
