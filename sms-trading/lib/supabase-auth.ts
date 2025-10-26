import { createBrowserSupabaseClient, supabase } from './supabase';
import type { AuthError } from '@supabase/supabase-js';

export type AuthResponse = {
  success: boolean;
  error?: AuthError | null;
  message?: string;
};

export type UserSession = {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
} | null;

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      },
    });

    if (error) {
      return { success: false, error, message: error.message };
    }

    return { success: true, message: 'Sign up successful. Please check your email to confirm.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Sign up failed' };
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error, message: error.message };
    }

    return { success: true, message: 'Signed in successfully' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Sign in failed' };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error, message: error.message };
    }

    return { success: true, message: 'Signed out successfully' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Sign out failed' };
  }
}

/**
 * Get current user session
 */
export async function getCurrentUser(): Promise<UserSession> {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user ? { id: data.user.id, email: data.user.email, user_metadata: data.user.user_metadata } : null;
  } catch {
    return null;
  }
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session || null;
  } catch {
    return null;
  }
}

/**
 * Reset password by sending email
 */
export async function resetPassword(email: string): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/reset-password`,
    });

    if (error) {
      return { success: false, error, message: error.message };
    }

    return { success: true, message: 'Password reset email sent' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Password reset failed' };
  }
}

/**
 * Update password with new password
 */
export async function updatePassword(newPassword: string): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error, message: error.message };
    }

    return { success: true, message: 'Password updated successfully' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Password update failed' };
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: UserSession) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    const user = session?.user ? { id: session.user.id, email: session.user.email, user_metadata: session.user.user_metadata } : null;
    callback(user);
  });
}