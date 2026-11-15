// POST /api/report — a student reports a problem with a question.
// Saves one small JSON file per report in Vercel Blob (store must be connected to this project).
const { put } = require('@vercel/blob');

const REASONS = ['Wrong answer key', 'Explanation is wrong', 'Typo or wording', 'Unclear or ambiguous', 'Image problem', 'Something else'];
const clip = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000b-\u001f]/g, '').trim().slice(0, n);

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'POST only' }); }
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ ok: false, error: 'not_configured' });
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = null; } }
  if (!b || typeof b !== 'object') return res.status(400).json({ ok: false, error: 'bad body' });
  if (b.website) return res.status(200).json({ ok: true }); // honeypot: bots fill hidden fields
  const r = {
    qid: clip(b.qid, 80), reason: clip(b.reason, 40), note: clip(b.note, 600),
    course: clip(b.course, 80), topic: clip(b.topic, 160), stem: clip(b.stem, 400),
    collection: clip(b.collection, 20), page: clip(b.page, 300), at: new Date().toISOString()
  };
  if (!/^[\w.:-]{1,80}$/.test(r.qid) || !REASONS.includes(r.reason)) return res.status(400).json({ ok: false, error: 'bad fields' });
  try {
    const safe = r.qid.replace(/[^\w-]/g, '_');
    await put('reports/' + Date.now() + '-' + safe + '.json', JSON.stringify(r), { access: 'public', addRandomSuffix: true, contentType: 'application/json' });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('report save failed', e && e.message);
    return res.status(500).json({ ok: false, error: 'save failed' });
  }
};
