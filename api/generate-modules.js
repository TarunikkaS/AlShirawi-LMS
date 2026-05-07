const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const buildPrompt = ({ courseTitle, courseDescription, courseType, trainingType, focusArea, numModules }) => `
You are an instructional designer. Generate exactly ${numModules} training modules for the following course.

Course Title: ${courseTitle}
Course Description: ${courseDescription || 'Not provided'}
Course Requirement: ${courseType}
Training Type: ${trainingType}
Focus Area: ${focusArea}

Return ONLY valid JSON in this exact format, no markdown, no explanation:
{
  "modules": [
    {
      "title": "Module title here",
      "description": "2-3 sentence description of what this module covers and what the learner will learn.",
      "order": 1
    }
  ]
}

Rules:
- Each module must be distinct and logically ordered
- Titles should be specific and action-oriented (e.g. "Understanding Safety Protocols" not "Module 1")
- Descriptions should be practical and relevant to the course focus area
- Generate exactly ${numModules} modules
`;

const callGemini = async (prompt, apiKey) => {
  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
    }),
  });
  if (response.status === 429) return { rateLimited: true };
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini error ${response.status}: ${text}`);
  }
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return { text };
};

const callGroq = async (prompt, apiKey) => {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
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
  const text = data.choices?.[0]?.message?.content || '';
  return { text };
};

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed.' }); return; }

  const sessionEmail = String(req.headers['x-lms-session-email'] || '').trim();
  if (!sessionEmail) { res.status(401).json({ error: 'Sign in before using AI generation.' }); return; }

  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  if (!geminiKey && !groqKey) {
    res.status(500).json({ error: 'No AI API key configured. Add GEMINI_API_KEY or GROQ_API_KEY to your Vercel environment variables.' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { courseTitle, courseDescription, courseType, trainingType, focusArea, numModules } = body;

  if (!courseTitle) { res.status(400).json({ error: 'courseTitle is required.' }); return; }

  const count = Math.min(Math.max(Number(numModules) || 5, 1), 10);
  const prompt = buildPrompt({ courseTitle, courseDescription, courseType, trainingType, focusArea, numModules: count });

  let resultText = null;

  if (geminiKey) {
    const geminiResult = await callGemini(prompt, geminiKey).catch((err) => { throw err; });
    if (!geminiResult.rateLimited) {
      resultText = geminiResult.text;
    } else if (groqKey) {
      const groqResult = await callGroq(prompt, groqKey);
      resultText = groqResult.text;
    } else {
      res.status(429).json({ error: 'Gemini daily limit reached. Add GROQ_API_KEY as a fallback.' });
      return;
    }
  } else if (groqKey) {
    const groqResult = await callGroq(prompt, groqKey);
    resultText = groqResult.text;
  }

  let parsed;
  try {
    parsed = JSON.parse(resultText);
  } catch {
    res.status(502).json({ error: 'AI returned invalid JSON. Try again.' });
    return;
  }

  const modules = (parsed.modules || []).map((mod, i) => ({
    title: String(mod.title || '').trim(),
    description: String(mod.description || '').trim(),
    order: Number(mod.order) || i + 1,
  })).filter((mod) => mod.title);

  if (!modules.length) {
    res.status(502).json({ error: 'AI did not return any modules. Try again.' });
    return;
  }

  res.status(200).json({ modules });
};
