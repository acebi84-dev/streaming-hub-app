import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bvggvperehlduxziaqfu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Q3JqA0F8fU7vE6fQMZ_ZcA_-x5qLhnk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  realtime: {
    enabled: false,
  },
});
