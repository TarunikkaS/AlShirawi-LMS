const { verifyToken } = require('./_auth');
const GEMINI_MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
];
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const buildPrompt = ({ courseTitle, courseDescription, courseType, trainingType, focusArea, numModules }) => `
You are an expert instructional designer creating professional employee training content.
Generate exactly ${numModules} training modules for the following course.

Course Title: ${courseTitle}
Course Description: ${courseDescription || 'Not provided'}
Course Requirement: ${courseType}
Training Type: ${trainingType}
Focus Area: ${focusArea}

Return ONLY valid JSON with no markdown fences or extra text:
{
  "modules": [
    {
      "title": "Specific action-oriented module title",
      "description": "One full paragraph (4-6 sentences) describing what this module covers, why it matters, and what the learner will achieve.",
      "imageKeyword": "2-3 word phrase for a relevant stock photo (e.g. 'workplace safety equipment')",
      "notes": "# 1. Module Overview\\n\\n[Write 100-150 words introducing this module: what it covers, why it matters to the employee, and how it connects to the course theme.]\\n\\n# 2. Learning Objectives\\n\\nBy the end of this module, learners will be able to:\\n\\n- **[Objective 1]**: [measurable outcome]\\n- **[Objective 2]**: [measurable outcome]\\n- **[Objective 3]**: [measurable outcome]\\n\\n# 3. Main Content\\n\\n## 3.1 Topic Introduction\\n\\n[2-3 paragraphs introducing the main topic, its background, and why it is relevant to this role or department.]\\n\\n## 3.2 [Key Concept 1 Name]\\n\\n[Detailed explanation of this concept — what it means, how it works, and why it matters in a workplace context. At least 150 words.]\\n\\n## 3.3 [Key Concept 2 Name]\\n\\n[Detailed explanation of this concept — what it means, how it works, and why it matters in a workplace context. At least 150 words.]\\n\\n## 3.4 [Key Concept 3 Name]\\n\\n[Detailed explanation of this concept — what it means, how it works, and why it matters in a workplace context. At least 150 words.]\\n\\n## 3.5 Examples\\n\\n[2-3 concrete, realistic examples of how employees in this role encounter or apply these concepts day-to-day.]\\n\\n# 4. Case Study / Practical Example\\n\\n[Write a realistic workplace scenario (200-250 words) that walks through a real situation an employee might face. Describe the challenge, the decision made, the outcome, and what can be learned from it.]\\n\\n# 5. Summary / Key Takeaways\\n\\n- [Key takeaway 1 — specific and actionable]\\n- [Key takeaway 2 — specific and actionable]\\n- [Key takeaway 3 — specific and actionable]\\n- [Key takeaway 4 — specific and actionable]\\n\\n# 6. Additional Resources\\n\\n- [Suggested reading, tool, or practice — relevant to this module topic]\\n- [Suggested reading, tool, or practice — relevant to this module topic]",
      "order": 1
    }
  ]
}

Rules:
- Each module must be distinct and logically ordered
- Titles must be specific (e.g. "Handling Customer Escalations" not "Module 1")
- Notes must follow the exact 6-section structure above — target 1500-2000 words per module
- Replace ALL placeholder text in brackets with real, detailed content relevant to the course
- imageKeyword must describe a real workplace scene related to the module
- Generate exactly ${numModules} modules
`;

const callGemini = async (prompt, apiKey) => {
  const errors = [];
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
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { text };
    }
    const errText = await response.text();
    errors.push(`${model} → ${response.status}: ${errText}`);
  }
  return { failed: true, error: errors.join(' | ') };
};

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
  const text = data.choices?.[0]?.message?.content || '';
  return { text };
};

const fetchPexelsImage = async (keyword, apiKey) => {
  try {
    const resp = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: apiKey } }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    const photo = data.photos?.[0];
    if (!photo) return null;
    return {
      id: `pexels-${photo.id}`,
      dataUrl: photo.src.large2x || photo.src.large,
      label: photo.alt || keyword,
    };
  } catch {
    return null;
  }
};

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed.' }); return; }

  const sessionEmail = await verifyToken(req, res);
  if (!sessionEmail) return;

  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const pexelsKey = process.env.PEXELS_API_KEY;

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
    const geminiResult = await callGemini(prompt, geminiKey);
    if (!geminiResult.failed) {
      resultText = geminiResult.text;
    } else if (groqKey) {
      const groqResult = await callGroq(prompt, groqKey);
      resultText = groqResult.text;
    } else {
      res.status(502).json({ error: `Gemini could not generate modules. Details: ${geminiResult.error}` });
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

  const rawModules = (parsed.modules || []).filter((mod) => mod.title);

  const modules = await Promise.all(
    rawModules.map(async (mod, i) => {
      let images = [];
      if (pexelsKey && mod.imageKeyword) {
        const img = await fetchPexelsImage(mod.imageKeyword, pexelsKey);
        if (img) images = [img];
      }
      return {
        title: String(mod.title || '').trim(),
        description: String(mod.description || '').trim(),
        notes: String(mod.notes || '').trim(),
        images,
        order: Number(mod.order) || i + 1,
      };
    })
  );

  if (!modules.length) {
    res.status(502).json({ error: 'AI did not return any modules. Try again.' });
    return;
  }

  res.status(200).json({ modules });
};
