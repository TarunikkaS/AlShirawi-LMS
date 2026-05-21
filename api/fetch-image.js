const { verifyToken } = require('./auth');
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed.' }); return; }

  const sessionEmail = await verifyToken(req, res);
  if (!sessionEmail) return;

  const pexelsKey = process.env.PEXELS_API_KEY;
  if (!pexelsKey) {
    res.status(500).json({ error: 'PEXELS_API_KEY is not configured in Vercel environment variables.' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const keyword = String(body.keyword || '').trim();
  const label = String(body.label || keyword).trim();

  if (!keyword) { res.status(400).json({ error: 'keyword is required.' }); return; }

  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=1&orientation=landscape`,
    { headers: { Authorization: pexelsKey } }
  );

  if (!response.ok) {
    const text = await response.text();
    res.status(502).json({ error: `Pexels error ${response.status}: ${text}` });
    return;
  }

  const data = await response.json();
  const photo = data.photos?.[0];

  if (!photo) {
    res.status(404).json({ error: `No images found for "${keyword}". Try a different keyword.` });
    return;
  }

  res.status(200).json({
    image: {
      id: `pexels-${photo.id}`,
      dataUrl: photo.src.large2x || photo.src.large,
      label: label || photo.alt || keyword,
    },
  });
};
