import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('your-supabase')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/**
 * Supabase Auth Service Layer
 */
export const supabaseAuth = {
  async signUp({ email, password, name, avatarUrl, country, phoneCode, phoneNumber }: {
    email: string;
    password: string;
    name: string;
    avatarUrl?: string;
    country?: string;
    phoneCode?: string;
    phoneNumber?: string;
  }) {
    if (!supabase) throw new Error('Supabase client not configured');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          avatar_url: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          country: country || 'India',
          phone_code: phoneCode || '+91',
          phone_number: phoneNumber || '',
          role: 'traveler'
        }
      }
    });

    if (error) throw error;
    return data;
  },

  async signIn({ email, password }: { email: string; password: string }) {
    if (!supabase) throw new Error('Supabase client not configured');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  async verifyOtp({ email, token, type = 'signup' }: { email: string; token: string; type?: any }) {
    if (!supabase) throw new Error('Supabase client not configured');

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type
    });

    if (error) throw error;
    return data;
  },

  async resetPasswordForEmail(email: string) {
    if (!supabase) throw new Error('Supabase client not configured');

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?mode=reset`
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }
};
