// İzlio — anında "seni takip etti" push bildirimi.
// Supabase Database Webhook (follows INSERT) -> bu endpoint -> Expo Push API.
// Güvenlik: x-webhook-secret header'ı PUSH_WEBHOOK_SECRET ile eşleşmeli. Service role ASLA repoda değil, env'de.

const SUPA_REST = 'https://bvggvperehlduxziaqfu.supabase.co/rest/v1';
const EXPO_PUSH = 'https://exp.host/--/api/v2/push/send';

async function sbService(path) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const res = await fetch(SUPA_REST + path, {
    headers: { apikey: key, Authorization: 'Bearer ' + key },
  });
  if (!res.ok) return null;
  return res.json();
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return await new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (_) { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.statusCode = 405; return res.end('Method Not Allowed'); }
  // Webhook doğrulama
  const secret = req.headers['x-webhook-secret'];
  if (!process.env.PUSH_WEBHOOK_SECRET || secret !== process.env.PUSH_WEBHOOK_SECRET) {
    res.statusCode = 401; return res.end('Unauthorized');
  }
  try {
    const body = await readBody(req);
    const rec = body && body.record ? body.record : null;
    if (!rec || !rec.following_id || !rec.follower_id) {
      res.statusCode = 200; return res.end(JSON.stringify({ ok: true, skipped: 'no record' }));
    }
    const followingId = rec.following_id; // bildirimi ALACAK kişi
    const followerId = rec.follower_id;   // takip EDEN kişi

    // Takip edilenin push token'larını (service role ile, RLS aşılır) ve takip edenin adını çek
    const [tokens, profs] = await Promise.all([
      sbService('/push_tokens?user_id=eq.' + followingId + '&select=token'),
      sbService('/public_profiles?id=eq.' + followerId + '&select=username,display_name'),
    ]);
    const tokenList = (Array.isArray(tokens) ? tokens : []).map((t) => t.token).filter(Boolean);
    if (tokenList.length === 0) {
      res.statusCode = 200; return res.end(JSON.stringify({ ok: true, skipped: 'no tokens' }));
    }
    const prof = Array.isArray(profs) ? profs[0] : null;
    const name = prof?.display_name || (prof?.username ? '@' + prof.username : 'Birisi');

    const messages = tokenList.map((to) => ({
      to,
      title: 'İzlio',
      body: name + ' seni takip etti',
      sound: 'default',
      data: { type: 'follow', userId: followerId },
    }));

    // Expo Push API (100'lük chunk'lar)
    for (let i = 0; i < messages.length; i += 100) {
      const chunk = messages.slice(i, i + 100);
      await fetch(EXPO_PUSH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(chunk),
      }).catch(() => {});
    }

    res.statusCode = 200;
    return res.end(JSON.stringify({ ok: true, sent: messages.length }));
  } catch (e) {
    res.statusCode = 200; // webhook retry fırtınası olmasın
    return res.end(JSON.stringify({ ok: false, error: String(e && e.message || e) }));
  }
}
