const { storage } = require('./firebase-admin');
const { verifyToken } = require('./auth');
const MAX_NAME_LEN = 160;

const sanitizeFileName = (name) => {
  const base = String(name || 'file').split('/').pop().split('\\').pop();
  return base
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+/, '')
    .slice(0, MAX_NAME_LEN) || 'file';
};

const randomId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

module.exports = async (req, res) => {
  try {
    if (req.method === 'OPTIONS') { res.status(204).end(); return; }
    if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed.' }); return; }

    const sessionEmail = await verifyToken(req, res);
    if (!sessionEmail) return;

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { fileName, fileType } = body;

    const safeName = sanitizeFileName(fileName);
    const objectPath = `module-files/${randomId()}-${safeName}`;
    const bucket = storage.bucket();
    const file = bucket.file(objectPath);

    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 60 * 60 * 1000,
      contentType: fileType || 'application/octet-stream',
    });

    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${objectPath}`;

    res.status(200).json({ uploadUrl, publicUrl, path: objectPath, bucket: bucketName });
  } catch (error) {
    res.status(500).json({ error: error.message || 'File upload signing failed.' });
  }
};
