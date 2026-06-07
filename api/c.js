// İzlio içerik landing page — sunucu tarafında OG etiketli HTML üretir.
// WhatsApp/X/iMessage botları JS çalıştırmadığı için <head> server-side render edilir.
// Route: /c/:id -> /api/c?id=:id (vercel.json rewrite)

const SUPA_URL = 'https://bvggvperehlduxziaqfu.supabase.co/rest/v1';
const SUPA_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_Q3JqA0F8fU7vE6fQMZ_ZcA_-x5qLhnk';
const SITE = 'https://izlio.app';
const APPSTORE_URL = 'https://apps.apple.com/app/izlio/id000000000'; // TODO: gerçek App Store linki

const PLATFORMS = {
  netflix:     { name: 'Netflix',     color: '#E50914' },
  amazon:      { name: 'Prime Video', color: '#00A8E1' },
  disney:      { name: 'Disney+',     color: '#0063E5' },
  hbo:         { name: 'HBO Max',     color: '#8B4FBE' },
  mubi:        { name: 'MUBI',        color: '#555555' },
  crunchyroll: { name: 'Crunchyroll', color: '#FF6600' },
};

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
<title>İçerik bulunamadı — İzlio</title>
<meta property="og:title" content="İzlio"><meta property="og:description" content="Bir sonraki favorini keşfet.">
<meta property="og:url" content="${SITE}"><meta name="twitter:card" content="summary">
</head><body style="margin:0;background:#000;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center">
<div><div style="font-size:48px;margin-bottom:16px">🎬</div>
<h1 style="font-size:22px;font-weight:800;margin:0 0 8px">İçerik bulunamadı</h1>
<p style="color:rgba(255,255,255,0.5);font-size:15px;margin:0 0 24px">Aradığın içerik kaldırılmış olabilir.</p>
<a href="${SITE}" style="display:inline-block;background:#fff;color:#000;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:14px">İzlio'ya git</a>
</div></body></html>`;
}

function pageHtml(c, avail) {
  const title = (c.original_language === 'tr' && c.title_tr) ? c.title_tr : (c.title_tr || c.title);
  const typeLabel = c.type === 'movie' ? 'Film' : 'Dizi';
  const metaParts = [typeLabel, c.year, c.imdb_score != null ? ('IMDb ' + Number(c.imdb_score).toFixed(1)) : null].filter(Boolean);
  const desc = (c.synopsis_tr || '').trim() || `${metaParts.join(' · ')} — İzlio'da keşfet.`;
  const shortDesc = desc.length > 200 ? desc.slice(0, 197) + '…' : desc;
  const poster = c.poster_url || '';
  const url = `${SITE}/c/${c.id}`;

  const badges = (avail || []).map(a => {
    const p = PLATFORMS[a.platform_slug];
    if (!p) return '';
    return `<span style="background:${p.color};color:#fff;font-weight:700;font-size:13px;padding:7px 14px;border-radius:10px;display:inline-block">${esc(p.name)}</span>`;
  }).join('');

  return `<!DOCTYPE html><html lang="tr"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — İzlio</title>
<meta name="description" content="${esc(shortDesc)}">
<meta property="og:type" content="video.${c.type === 'movie' ? 'movie' : 'tv_show'}">
<meta property="og:site_name" content="İzlio">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(shortDesc)}">
<meta property="og:url" content="${esc(url)}">
${poster ? `<meta property="og:image" content="${esc(poster)}">
<meta property="og:image:width" content="480">
<meta property="og:image:height" content="720">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(shortDesc)}">
${poster ? `<meta name="twitter:image" content="${esc(poster)}">` : ''}
<style>
*{box-sizing:border-box}
body{margin:0;background:#000;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:560px;margin:0 auto;padding:32px 20px 48px}
.poster{width:200px;aspect-ratio:2/3;border-radius:16px;object-fit:cover;display:block;margin:0 auto 24px;background:rgba(255,255,255,0.06)}
h1{font-size:26px;font-weight:800;letter-spacing:-0.5px;text-align:center;margin:0 0 10px;line-height:1.2}
.meta{color:rgba(255,255,255,0.55);font-size:14px;text-align:center;margin:0 0 22px}
.imdb{display:inline-block;background:#F5C518;color:#000;font-size:11px;font-weight:900;padding:2px 6px;border-radius:4px;margin-left:2px}
.badges{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 24px}
.synopsis{color:rgba(255,255,255,0.8);font-size:15px;line-height:1.6;margin:0 0 28px}
.cta{display:block;background:#fff;color:#000;font-weight:800;font-size:16px;text-decoration:none;text-align:center;padding:16px;border-radius:14px;margin:0 auto;max-width:360px}
.brand{text-align:center;color:rgba(255,255,255,0.3);font-size:12px;margin-top:28px;letter-spacing:2px;font-weight:800}
</style>
</head>
<body>
<div class="wrap">
  ${poster ? `<img class="poster" src="${esc(poster)}" alt="${esc(title)}">` : ''}
  <h1>${esc(title)}</h1>
  <p class="meta">${esc(typeLabel)}${c.year ? ' · ' + esc(c.year) : ''}${c.imdb_score != null ? ' · <span class="imdb">IMDb</span> ' + esc(Number(c.imdb_score).toFixed(1)) : ''}</p>
  ${badges ? `<div class="badges">${badges}</div>` : ''}
  ${c.synopsis_tr ? `<p class="synopsis">${esc(c.synopsis_tr)}</p>` : ''}
  <a class="cta" href="${esc(APPSTORE_URL)}">Uygulamada Aç</a>
  <div class="brand">İZLİO</div>
</div>
</body></html>`;
}

export default async function handler(req, res) {
  const id = (req.query && req.query.id) ? String(req.query.id).replace(/[^0-9]/g, '') : '';
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (!id) {
    res.statusCode = 404;
    return res.end(notFoundHtml());
  }
  try {
    const rows = await sb(`/hub_contents?id=eq.${id}&select=id,title,title_tr,type,year,imdb_score,poster_url,synopsis_tr,original_language&limit=1`);
    const c = Array.isArray(rows) ? rows[0] : null;
    if (!c) {
      res.statusCode = 404;
      return res.end(notFoundHtml());
    }
    const avail = await sb(`/hub_availability?content_id=eq.${id}&select=platform_slug,platform_url`);
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.statusCode = 200;
    return res.end(pageHtml(c, Array.isArray(avail) ? avail : []));
  } catch (e) {
    res.statusCode = 404;
    return res.end(notFoundHtml());
  }
}
