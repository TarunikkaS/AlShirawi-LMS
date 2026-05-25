const { auth } = require('./firebase-admin');

const verifyToken = async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Missing auth token.' });
    return null;
  }
  try {
    const decoded = await auth.verifyIdToken(token);
    return decoded.email;
  } catch (err) {
    const code = err.code || err.errorInfo?.code || 'unknown';
    res.status(401).json({ error: `Token error: ${code}` });
    return null;
  }
};

module.exports = { verifyToken };
