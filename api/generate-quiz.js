const { verifyToken } = require('./auth');
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_MODELS = ['gemini-2.0-flash-lite', 'gemini-2.0-flash'];

const buildPrompt = ({ quizTitle, scopeTitle, scopeType, numQuestions }) => `
You are an expert instructional designer creating a multiple-choice quiz for employee training.

Quiz Title: ${quizTitle}
${scopeType === 'module' ? `Module: ${scopeTitle}` : `Course: ${scopeTitle}`}
Number of Questions: ${numQuestions}

Generate exactly ${numQuestions} multiple-choice questions. Each question must have exactly 4 options and one correct answer.

Return ONLY valid JSON with no markdown fences:
{
  "questions": [
    {
      "text": "Clear, unambiguous question text?",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "answer": 0
    }
  ]
}

Rules:
- "answer" is the zero-based index of the correct option (0 = A, 1 = B, 2 = C, 3 = D)
- Questions must test real understanding, not just recall of definitions
- All 4 options must be plausible — avoid obviously wrong distractors
- Vary which index is the correct answer across questions
- Questions must be directly relevant to the quiz title and scope
- Generate exactly ${numQuestions} questions
`;

const callGroq = async (prompt, apiKey) => {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq error ${response.status}: ${text}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
};

const callGemini = async (prompt, apiKey) => {
  for (const model of GEMINI_MODELS) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
        }),
      }
    );
    if (response.ok) {
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
  }
  return null;
};

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed.' }); return; }

  const sessionEmail = await verifyToken(req, res);
  if (!sessionEmail) return;

  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!groqKey && !geminiKey) {
    res.status(500).json({ error: 'No AI API key configured.' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { quizTitle, scopeTitle, scopeType, numQuestions } = body;

  if (!quizTitle) { res.status(400).json({ error: 'quizTitle is required.' }); return; }

  const count = Math.min(Math.max(Number(numQuestions) || 5, 1), 15);
  const prompt = buildPrompt({ quizTitle, scopeTitle: scopeTitle || quizTitle, scopeType: scopeType || 'course', numQuestions: count });

  let resultText = null;
  try {
    if (groqKey) {
      resultText = await callGroq(prompt, groqKey);
    } else {
      resultText = await callGemini(prompt, geminiKey);
    }
  } catch (err) {
    res.status(502).json({ error: err.message || 'AI generation failed.' });
    return;
  }

  if (!resultText) {
    res.status(502).json({ error: 'AI did not return any content. Try again.' });
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(resultText);
  } catch {
    res.status(502).json({ error: 'AI returned invalid JSON. Try again.' });
    return;
  }

  const questions = (parsed.questions || [])
    .filter((q) => q.text && Array.isArray(q.options) && q.options.length === 4)
    .map((q) => ({
      text: String(q.text).trim(),
      options: q.options.map((o) => String(o).trim()),
      answer: Math.min(Math.max(Number(q.answer) || 0, 0), 3),
    }));

  if (!questions.length) {
    res.status(502).json({ error: 'AI did not return valid questions. Try again.' });
    return;
  }

  res.status(200).json({ questions });
};
