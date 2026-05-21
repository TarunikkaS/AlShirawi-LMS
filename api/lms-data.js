const { db } = require('./firebase-admin');
const { verifyToken } = require('./auth');

const COLLECTIONS = [
  'users', 'courses', 'modules', 'assignments',
  'assignment_rules', 'quizzes', 'progress', 'quiz_attempts', 'certificates',
];

const readRecords = async (collection) => {
  const snapshot = await db.collection(collection).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const replaceRecords = async (collection, records, previousIds = []) => {
  const batch = db.batch();
  const nextIds = new Set(records.map((r) => r.id).filter(Boolean));

  for (const record of records) {
    if (!record.id) continue;
    const ref = db.collection(collection).doc(record.id);
    batch.set(ref, record, { merge: true });
  }

  for (const id of previousIds) {
    if (!nextIds.has(id)) {
      batch.delete(db.collection(collection).doc(id));
    }
  }

  await batch.commit();
};

module.exports = async (req, res) => {
  try {
    if (req.method === 'OPTIONS') { res.status(204).end(); return; }

    const email = await verifyToken(req, res);
    if (!email) return;

    const collection = req.query.collection;
    if (!COLLECTIONS.includes(collection)) {
      res.status(400).json({ error: 'Unknown LMS data collection.' });
      return;
    }

    if (req.method === 'GET') {
      const records = await readRecords(collection);
      res.status(200).json({ records });
      return;
    }

    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const records = Array.isArray(body.records) ? body.records : [];
      const previousIds = Array.isArray(body.previousIds) ? body.previousIds : [];
      await replaceRecords(collection, records, previousIds);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'LMS data API failed.' });
  }
};
