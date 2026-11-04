/**
 * Supabase Client Integration
 * Synchronized with Arjawinangun Delivery (AWD) Admin backend:
 * https://suderyderry.github.io/awd-admin/
 */

import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL || 'https://rnupmsvtpvbcfssnsvva.supabase.co';
export const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_BF3L3GU713VGjNEu1xq80A_f2PqHIoz';

/** Aplikasi toko selalu tersambung ke database AWD (kunci publishable memang publik; data dilindungi RLS). */
export const LIVE = true;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});
