import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bvggvperehlduxziaqfu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Q3JqA0F8fU7vE6fQMZ_ZcA_-x5qLhnk';

// React Native iOS JSC'de AbortController bazen çalışmaz.
// XHR'ın native timeout özelliği kullanılıyor — platform seviyesinde çalışır.
function fetchWithTimeout(url, options = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.timeout = 10000;
    xhr.ontimeout = () => reject(new Error('Network timeout'));
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.onload = () => {
      const status = xhr.status;
      const responseText = xhr.responseText;
      const getHeader = (h) => xhr.getResponseHeader(h);
      const body = {
        text: () => Promise.resolve(responseText),
        json: () => {
          try { return Promise.resolve(JSON.parse(responseText)); }
          catch (e) { return Promise.reject(e); }
        },
      };
      resolve({
        ok: status >= 200 && status < 300,
        status,
        statusText: xhr.statusText || '',
        headers: { get: getHeader },
        ...body,
        clone: () => ({ ok: status >= 200 && status < 300, status, statusText: xhr.statusText || '', headers: { get: getHeader }, ...body }),
      });
    };
    xhr.open(options.method || 'GET', url);
    const hdrs = options.headers || {};
    if (typeof hdrs.forEach === 'function') {
      hdrs.forEach((v, k) => xhr.setRequestHeader(k, v));
    } else {
      Object.keys(hdrs).forEach(k => xhr.setRequestHeader(k, String(hdrs[k])));
    }
    xhr.send(options.body !== undefined ? options.body : null);
  });
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
