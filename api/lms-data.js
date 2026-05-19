const COLLECTIONS = {
  users: {
    table: 'profiles',
    fromRow: (row) => ({
      id: row.id,
      employeeId: row.employee_id || '',
      name: row.name || '',
      designation: row.designation || '',
      email: row.email || '',
      department: row.department || '',
      businessLine: row.business_line || '',
      businessLineOther: row.business_line_other || '',
      role: row.role || 'learner',
      createdAt: row.created_at_ms || 0,
      createdBy: row.created_by || '',
    }),
    toRow: (item) => ({
      id: item.id,
      employee_id: item.employeeId || '',
      name: item.name || '',
      designation: item.designation || '',
      email: item.email || '',
      department: item.department || '',
      business_line: item.businessLine || '',
      business_line_other: item.businessLineOther || '',
      role: item.role || 'learner',
      created_at_ms: item.createdAt || Date.now(),
      created_by: item.createdBy || '',
    }),
  },
  courses: {
    table: 'courses',
    fromRow: (row) => ({
      id: row.id,
      title: row.title || '',
      description: row.description || '',
      type: row.type || 'Essential',
      trainingType: row.training_type || 'Behavioral',
      focusArea: row.focus_area || '',
      createdAt: row.created_at_ms || 0,
    }),
    toRow: (item) => ({
      id: item.id,
      title: item.title || '',
      description: item.description || '',
      type: item.type || 'Essential',
      training_type: item.trainingType || 'Behavioral',
      focus_area: item.focusArea || '',
      created_at_ms: item.createdAt || Date.now(),
    }),
  },
  modules: {
    table: 'modules',
    fromRow: (row) => ({
      id: row.id,
      courseId: row.course_id || '',
      title: row.title || '',
      description: row.description || '',
      order: row.display_order || 1,
      videoUrl: row.video_url || '',
      notes: row.notes || '',
      applicability: row.applicability || { designationKeyword: '', departmentKeyword: '', businessLines: [] },
      documents: row.documents || [],
      images: row.images || [],
      createdAt: row.created_at_ms || 0,
    }),
    toRow: (item) => ({
      id: item.id,
      course_id: item.courseId || '',
      title: item.title || '',
      description: item.description || '',
      display_order: Number(item.order) || 1,
      video_url: item.videoUrl || '',
      notes: item.notes || '',
      applicability: item.applicability || { designationKeyword: '', departmentKeyword: '', businessLines: [] },
      documents: item.documents || [],
      images: item.images || [],
      created_at_ms: item.createdAt || Date.now(),
    }),
  },
  assignments: {
    table: 'assignments',
    fromRow: (row) => ({
      id: row.id,
      email: row.email || '',
      courseId: row.course_id || '',
      dueDate: row.due_date || '',
      assignedAt: row.assigned_at_ms || 0,
      source: row.source || '',
      assignmentType: row.assignment_type || 'Essential',
    }),
    toRow: (item) => ({
      id: item.id,
      email: item.email || '',
      course_id: item.courseId || '',
      due_date: item.dueDate || null,
      assigned_at_ms: item.assignedAt || Date.now(),
      source: item.source || '',
      assignment_type: item.assignmentType || 'Essential',
    }),
  },
  assignment_rules: {
    table: 'assignment_rules',
    fromRow: (row) => ({
      id: row.id,
      name: row.name || '',
      courseId: row.course_id || '',
      dueDate: row.due_date || '',
      designationKeyword: row.designation_keyword || '',
      departmentKeyword: row.department_keyword || '',
      businessLines: row.business_lines || [],
      createdAt: row.created_at_ms || 0,
    }),
    toRow: (item) => ({
      id: item.id,
      name: item.name || '',
      course_id: item.courseId || '',
      due_date: item.dueDate || null,
      designation_keyword: item.designationKeyword || '',
      department_keyword: item.departmentKeyword || '',
      business_lines: item.businessLines || [],
      created_at_ms: item.createdAt || Date.now(),
    }),
  },
  quizzes: {
    table: 'quizzes',
    fromRow: (row) => ({
      id: row.id,
      title: row.title || '',
      scopeType: row.scope_type || 'course',
      scopeId: row.scope_id || '',
      passMark: row.pass_mark || 80,
      maxAttempts: row.max_attempts || 3,
      questions: row.questions || [],
      createdAt: row.created_at_ms || 0,
    }),
    toRow: (item) => ({
      id: item.id,
      title: item.title || '',
      scope_type: item.scopeType || 'course',
      scope_id: item.scopeId || '',
      pass_mark: Number(item.passMark) || 80,
      max_attempts: Number(item.maxAttempts) || 3,
      questions: item.questions || [],
      created_at_ms: item.createdAt || Date.now(),
    }),
  },
  progress: {
    table: 'progress',
    fromRow: (row) => ({
      id: row.id,
      email: row.email || '',
      courseId: row.course_id || '',
      moduleId: row.module_id || '',
      completedAt: row.completed_at_ms || 0,
    }),
    toRow: (item) => ({
      id: item.id,
      email: item.email || '',
      course_id: item.courseId || '',
      module_id: item.moduleId || '',
      completed_at_ms: item.completedAt || Date.now(),
    }),
  },
  quiz_attempts: {
    table: 'quiz_attempts',
    fromRow: (row) => ({
      id: row.id,
      email: row.email || '',
      quizId: row.quiz_id || '',
      scopeType: row.scope_type || 'course',
      scopeId: row.scope_id || '',
      score: row.score || 0,
      passed: Boolean(row.passed),
      takenAt: row.taken_at_ms || 0,
    }),
    toRow: (item) => ({
      id: item.id,
      email: item.email || '',
      quiz_id: item.quizId || '',
      scope_type: item.scopeType || 'course',
      scope_id: item.scopeId || '',
      score: Number(item.score) || 0,
      passed: Boolean(item.passed),
      taken_at_ms: item.takenAt || Date.now(),
    }),
  },
  certificates: {
    table: 'certificates',
    fromRow: (row) => ({
      id: row.id,
      email: row.email || '',
      learnerName: row.learner_name || '',
      employeeId: row.employee_id || '',
      courseId: row.course_id || '',
      courseTitle: row.course_title || '',
      courseType: row.course_type || '',
      badgeTitle: row.badge_title || '',
      issuedAt: row.issued_at_ms || 0,
      emailStatus: row.email_status || '',
    }),
    toRow: (item) => ({
      id: item.id,
      email: item.email || '',
      learner_name: item.learnerName || '',
      employee_id: item.employeeId || '',
      course_id: item.courseId || '',
      course_title: item.courseTitle || '',
      course_type: item.courseType || '',
      badge_title: item.badgeTitle || '',
      issued_at_ms: item.issuedAt || Date.now(),
      email_status: item.emailStatus || '',
    }),
  },
};

const getConfig = () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing VITE_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  }
  return { supabaseUrl: supabaseUrl.replace(/\/$/, ''), serviceRoleKey };
};

const restFetch = async (path, options = {}) => {
  const { supabaseUrl, serviceRoleKey } = getConfig();
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Supabase REST request failed with ${response.status}`);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

const idsFilter = (ids) => `in.(${ids.map((id) => `"${String(id).replace(/"/g, '\\"')}"`).join(',')})`;

const readRecords = async (definition) => {
  const rows = await restFetch(`${definition.table}?select=*`);
  return (rows || []).map(definition.fromRow);
};

const replaceRecords = async (definition, records, previousIds = []) => {
  const rows = records.filter((item) => item && item.id).map(definition.toRow);
  const nextIds = new Set(rows.map((row) => row.id));
  const staleIds = previousIds.filter((id) => !nextIds.has(id));

  if (rows.length > 0) {
    await restFetch(`${definition.table}?on_conflict=id`, {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(rows),
    });
  }

  if (staleIds.length > 0) {
    await restFetch(`${definition.table}?id=${encodeURIComponent(idsFilter(staleIds))}`, {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' },
    });
  }
};

module.exports = async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    const collection = req.query.collection;
    const definition = COLLECTIONS[collection];
    if (!definition) {
      res.status(400).json({ error: 'Unknown LMS data collection.' });
      return;
    }

    if (req.method === 'GET') {
      const records = await readRecords(definition);
      res.status(200).json({ records });
      return;
    }

    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const records = Array.isArray(body.records) ? body.records : [];
      const previousIds = Array.isArray(body.previousIds) ? body.previousIds : [];
      await replaceRecords(definition, records, previousIds);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'LMS data API failed.' });
  }
};
