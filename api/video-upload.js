const BUCKET = 'module-videos';
const MAX_NAME_LEN = 160;

const getConfig = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing VITE_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  }
  return { supabaseUrl: supabaseUrl.replace(/\/$/, ''), serviceRoleKey };
};

const sanitizeFileName = (name) => {
  const base = String(name || 'video.mp4').split('/').pop().split('\\').pop();
  return base
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+/, '')
    .slice(0, MAX_NAME_LEN) || 'video.mp4';
};

const randomId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

module.exports = async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed.' });
      return;
    }

    const sessionEmail = String(req.headers['x-lms-session-email'] || '').trim();
    if (!sessionEmail) {
      res.status(401).json({ error: 'Sign in before uploading videos.' });
      return;
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { fileName, fileType } = body;
    if (fileType && !/^video\//i.test(fileType)) {
      res.status(400).json({ error: 'Only video files are allowed.' });
      return;
    }

    const { supabaseUrl, serviceRoleKey } = getConfig();
    const safeName = sanitizeFileName(fileName);
    const objectPath = `${randomId()}-${safeName}`;

    const signResponse = await fetch(`${supabaseUrl}/storage/v1/object/upload/sign/${BUCKET}/${objectPath}`, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!signResponse.ok) {
      const text = await signResponse.text();
      res.status(502).json({ error: `Could not create upload URL (${signResponse.status}): ${text}` });
      return;
    }

    const signData = await signResponse.json();
    const signedRelativeUrl = String(signData.url || '');
    if (!signedRelativeUrl) {
      res.status(502).json({ error: 'Supabase did not return an upload URL.' });
      return;
    }

    const uploadUrl = signedRelativeUrl.startsWith('http')
      ? signedRelativeUrl
      : `${supabaseUrl}/storage/v1${signedRelativeUrl.startsWith('/') ? '' : '/'}${signedRelativeUrl}`;
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${objectPath}`;

    res.status(200).json({
      uploadUrl,
      publicUrl,
      path: objectPath,
      bucket: BUCKET,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Video upload signing failed.' });
  }
};
