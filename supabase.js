import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bvggvperehlduxziaqfu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Q3JqA0F8fU7vE6fQMZ_ZcA_-x5qLhnk';

// React Native iOS'ta Supabase client async operasyonları bazen hang eder.
// fetchWithTimeout her isteği 12 saniyede keser ve hata döndürür.
function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 12000);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

// AsyncStorage kurulu olmadığından in-memory storage kullanıyoruz.
// Oturum uygulama kapanana kadar açık kalır.
const _store = {};
const inMemoryStorage = {
  getItem:    (key)        => Promise.resolve(_store[key] ?? null),
  setItem:    (key, value) => { _store[key] = value; return Promise.resolve(); },
  removeItem: (key)        => { delete _store[key]; return Promise.resolve(); },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  global: { fetch: fetchWithTimeout },
  auth: {
    persistSession: true,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storage: inMemoryStorage,
    flowType: 'implicit',
  },
  realtime: {
    enabled: false,
  },
});

// Public (anon) client for content queries — never carries JWT session,
// so hub_contents / hub_availability / hub_popular / hub_collections queries
// are unaffected by the authenticated session set after login.
const _noStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
export const supabasePublic = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storage: _noStorage,
    flowType: 'implicit',
  },
  realtime: { enabled: false },
});
