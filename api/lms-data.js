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

const BATCH_LIMIT = 499;

const sanitize = (obj) => JSON.parse(JSON.stringify(obj, (_, v) => (v === undefined ? null : v)));

const replaceRecords = async (collection, records, previousIds = []) => {
  const nextIds = new Set(records.map((r) => r.id).filter(Boolean));
  const ops = [];

  for (const record of records) {
    if (!record.id) continue;
    ops.push({ type: 'set', id: record.id, data: sanitize(record) });
  }
  for (const id of previousIds) {
    if (!nextIds.has(id)) ops.push({ type: 'delete', id });
  }

  for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
    const batch = db.batch();
    for (const op of ops.slice(i, i + BATCH_LIMIT)) {
      const ref = db.collection(collection).doc(op.id);
      if (op.type === 'set') batch.set(ref, op.data, { merge: true });
      else batch.delete(ref);
    }
    await batch.commit();
  }
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
