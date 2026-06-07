// İzlio kullanıcı profili landing page — sunucu tarafında OG etiketli HTML.
// Route: /u/:username -> /api/u?username=:username (vercel.json rewrite)

const SUPA_URL = 'https://bvggvperehlduxziaqfu.supabase.co/rest/v1';
const SUPA_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_Q3JqA0F8fU7vE6fQMZ_ZcA_-x5qLhnk';
const SITE = 'https://izlio.app';
const OG_DEFAULT = SITE + '/og-izlio.png';
const APPSTORE_URL = 'https://apps.apple.com/app/izlio/id000000000'; // TODO: gerçek App Store linki

const AVATAR_COLORS = ['#FF6B6B', '#FFA94D', '#FFD43B', '#69DB7C', '#38D9A9', '#4DABF7', '#748FFC', '#9775FA', '#DA77F2', '#F783AC', '#00BBF9', '#FB8500'];
function avatarColorFor(seed) {
  const s = String(seed || '');
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
function avatarInitial(name) {
  const s = (name || '').trim();
  return s ? s.slice(0, 1).toUpperCase() : '?';
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function sb(path) {
  const res = await fetch(SUPA_URL + path, {
    headers: { apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY },
  });
  if (!res.ok) return null;
  return res.json();
}

function notFoundHtml() {
  return `<!DOCTYPE html><html lang="tr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kullanıcı bulunamadı — İzlio</title>
<meta property="og:title" content="İzlio"><meta property="og:description" content="Bir sonraki favorini keşfet.">
<meta property="og:image" content="${OG_DEFAULT}"><meta property="og:url" content="${SITE}"><meta name="twitter:card" content="summary">
</head><body style="margin:0;background:#000;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center">
<div><div style="font-size:48px;margin-bottom:16px">👤</div>
<h1 style="font-size:22px;font-weight:800;margin:0 0 8px">Kullanıcı bulunamadı</h1>
<p style="color:rgba(255,255,255,0.5);font-size:15px;margin:0 0 24px">Bu kullanıcı adı mevcut değil.</p>
<a href="${SITE}" style="display:inline-block;background:#fff;color:#000;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:14px">İzlio'ya git</a>
</div></body></html>`;
}

function pageHtml(p, stats) {
  const display = p.display_name || p.username || 'Kullanıcı';
  const watched = stats?.watched_count ?? 0;
  const followers = stats?.follower_count ?? 0;
  const following = stats?.following_count ?? 0;
  const url = `${SITE}/u/${encodeURIComponent(p.username)}`;
  const ogImage = p.avatar_url || OG_DEFAULT;
  const title = `${display} (@${p.username}) — İzlio`;
  const desc = `${watched} içerik izledi · ${followers} takipçi · İzlio'da film/dizi keşfi`;
  const color = avatarColorFor(p.id);
  const initial = avatarInitial(display);

  const avatarHtml = p.avatar_url
    ? `<img class="avatar" src="${esc(p.avatar_url)}" alt="${esc(display)}">`
    : `<div class="avatar initial" style="background:${color}">${esc(initial)}</div>`;

  return `<!DOCTYPE html><html lang="tr"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="İzlio">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(ogImage)}">
<style>
*{box-sizing:border-box}
body{margin:0;background:#000;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:520px;margin:0 auto;padding:48px 24px;text-align:center}
.avatar{width:104px;height:104px;border-radius:52px;object-fit:cover;display:block;margin:0 auto 18px;background:rgba(255,255,255,0.06)}
.avatar.initial{display:flex;align-items:center;justify-content:center;font-size:44px;font-weight:800;color:#fff}
h1{font-size:24px;font-weight:800;margin:0 0 4px;letter-spacing:-0.3px}
.handle{color:rgba(255,255,255,0.5);font-size:15px;font-weight:600;margin:0 0 16px}
.bio{color:rgba(255,255,255,0.7);font-size:15px;line-height:1.55;margin:0 0 22px}
.stats{display:flex;justify-content:center;gap:28px;margin:0 0 30px}
.stat{display:flex;flex-direction:column;gap:2px}
.stat b{font-size:19px;font-weight:800}
.stat span{font-size:12.5px;color:rgba(255,255,255,0.45);font-weight:600}
.cta{display:block;background:#fff;color:#000;font-weight:800;font-size:16px;text-decoration:none;text-align:center;padding:16px;border-radius:14px;margin:0 auto;max-width:360px}
.brand{color:rgba(255,255,255,0.3);font-size:12px;margin-top:30px;letter-spacing:2px;font-weight:800}
</style>
</head>
<body>
<div class="wrap">
  ${avatarHtml}
  <h1>${esc(display)}</h1>
  <p class="handle">@${esc(p.username)}</p>
  ${p.bio ? `<p class="bio">${esc(p.bio)}</p>` : ''}
  <div class="stats">
    <div class="stat"><b>${watched}</b><span>İzlendi</span></div>
    <div class="stat"><b>${followers}</b><span>Takipçi</span></div>
    <div class="stat"><b>${following}</b><span>Takip</span></div>
  </div>
  <a class="cta" href="${esc(APPSTORE_URL)}">İzlio'da Takip Et</a>
  <div class="brand">İZLİO</div>
</div>
</body></html>`;
}

export default async function handler(req, res) {
  const raw = (req.query && req.query.username) ? String(req.query.username) : '';
  const uname = raw.replace(/[^a-zA-Z0-9_]/g, '');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (!uname) {
    res.statusCode = 404;
    return res.end(notFoundHtml());
  }
  try {
    const esced = uname.replace(/_/g, '\\_'); // ilike'da _ tek karakter joker; kaçır
    const rows = await sb(`/public_profiles?username=ilike.${esced}&select=id,username,display_name,bio,avatar_url&limit=1`);
    const p = Array.isArray(rows) ? rows[0] : null;
    if (!p) {
      res.statusCode = 404;
      return res.end(notFoundHtml());
    }
    const statsRows = await sb(`/public_profile_stats?id=eq.${p.id}&select=watched_count,follower_count,following_count&limit=1`);
    const stats = Array.isArray(statsRows) ? statsRows[0] : null;
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=86400');
    res.statusCode = 200;
    return res.end(pageHtml(p, stats));
  } catch (e) {
    res.statusCode = 404;
    return res.end(notFoundHtml());
  }
}
