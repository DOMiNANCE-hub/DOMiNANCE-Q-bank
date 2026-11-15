// GET /api/reports      — list reports (newest first). Needs header x-admin-key = ADMIN_KEY.
// DELETE /api/reports?url=…  — mark one report done (deletes it; deletes are free).
const crypto = require('crypto');
const { list, del } = require('@vercel/blob');

function authed(req) {
  const want = process.env.ADMIN_KEY || '', got = String(req.headers['x-admin-key'] || '');
  if (want.length < 8 || got.length !== want.length) return false;
  return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(want));
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!process.env.BLOB_READ_WRITE_TOKEN || !process.env.ADMIN_KEY) return res.status(503).json({ ok: false, error: 'not_configured' });
  if (!authed(req)) return res.status(401).json({ ok: false, error: 'wrong password' });
  try {
    if (req.method === 'DELETE') {
      const url = String((req.query && req.query.url) || '');
      if (!/^https:\/\/[\w.-]+\.blob\.vercel-storage\.com\/reports\//.test(url)) return res.status(400).json({ ok: false, error: 'bad url' });
      await del(url);
      return res.status(200).json({ ok: true });
    }
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET, DELETE'); return res.status(405).json({ ok: false }); }
    const { blobs } = await list({ prefix: 'reports/', limit: 1000 });
    blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    const top = blobs.slice(0, 300);
    const items = await Promise.all(top.map(async x => {
      try { const r = await fetch(x.url, { cache: 'no-store' }); const j = await r.json(); return Object.assign(j, { url: x.url }); }
      catch (e) { return { url: x.url, at: x.uploadedAt, reason: '?', qid: '?', note: 'Could not read this report.' }; }
    }));
    return res.status(200).json({ ok: true, total: blobs.length, items });
  } catch (e) {
    console.error('reports failed', e && e.message);
    return res.status(500).json({ ok: false, error: 'server error' });
  }
};
