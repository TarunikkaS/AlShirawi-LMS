-- Al Shirawi LMS Supabase schema.
-- Run this in the Supabase SQL editor for the default public schema.
-- The current app keeps its existing local email-based login flow and reaches
-- these tables through Vercel API routes that use SUPABASE_SERVICE_ROLE_KEY.

create table if not exists public.profiles (
  id text primary key,
  employee_id text not null,
  name text not null,
  designation text not null,
  email text not null unique,
  department text not null,
  business_line text not null,
  business_line_other text default '',
  role text not null default 'learner' check (role in ('superadmin', 'admin', 'hr', 'trainer', 'learner')),
  created_at_ms bigint not null,
  created_by text default '',
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id text primary key,
  title text not null,
  description text default '',
  type text not null check (type in ('Essential', 'Desirable')),
  training_type text not null check (training_type in ('Behavioral', 'Functional')),
  focus_area text not null,
  created_at_ms bigint not null,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.modules (
  id text primary key,
  course_id text not null,
  title text not null,
  description text default '',
  display_order integer not null default 1,
  video_url text default '',
  notes text default '',
  applicability jsonb not null default '{"designationKeyword":"","departmentKeyword":"","businessLines":[]}'::jsonb,
  documents jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  created_at_ms bigint not null,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assignments (
  id text primary key,
  email text not null,
  course_id text not null,
  due_date date,
  assigned_at_ms bigint not null,
  source text default '',
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email, course_id)
);

create table if not exists public.assignment_rules (
  id text primary key,
  name text not null,
  course_id text not null,
  due_date date,
  designation_keyword text default '',
  department_keyword text default '',
  business_lines jsonb not null default '[]'::jsonb,
  created_at_ms bigint not null,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quizzes (
  id text primary key,
  title text not null,
  scope_type text not null check (scope_type in ('course', 'module')),
  scope_id text not null,
  pass_mark integer not null default 80 check (pass_mark between 0 and 100),
  max_attempts integer not null default 3 check (max_attempts > 0),
  questions jsonb not null default '[]'::jsonb,
  created_at_ms bigint not null,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id text primary key,
  quiz_id text not null,
  question_order integer not null default 1,
  text text not null,
  options jsonb not null default '[]'::jsonb,
  answer integer not null default 0,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id text primary key,
  email text not null,
  quiz_id text not null,
  scope_type text not null check (scope_type in ('course', 'module')),
  scope_id text not null,
  score integer not null check (score between 0 and 100),
  passed boolean not null default false,
  taken_at_ms bigint not null,
  inserted_at timestamptz not null default now()
);

create table if not exists public.progress (
  id text primary key,
  email text not null,
  course_id text not null,
  module_id text not null,
  completed_at_ms bigint not null,
  inserted_at timestamptz not null default now(),
  unique (email, course_id, module_id)
);

create table if not exists public.certificates (
  id text primary key,
  email text not null,
  learner_name text not null,
  employee_id text not null,
  course_id text not null,
  course_title text not null,
  course_type text not null,
  badge_title text not null,
  issued_at_ms bigint not null,
  email_status text default '',
  inserted_at timestamptz not null default now(),
  unique (email, course_id)
);

create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists modules_course_id_idx on public.modules(course_id);
create index if not exists assignments_email_idx on public.assignments(email);
create index if not exists assignments_course_id_idx on public.assignments(course_id);
create index if not exists quizzes_scope_idx on public.quizzes(scope_type, scope_id);
create index if not exists quiz_attempts_email_idx on public.quiz_attempts(email);
create index if not exists progress_email_course_idx on public.progress(email, course_id);
create index if not exists certificates_email_idx on public.certificates(email);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_rules enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.progress enable row level security;
alter table public.certificates enable row level security;

-- No anon policies are created here. The current transitional app uses the
-- Vercel server function with SUPABASE_SERVICE_ROLE_KEY. When Supabase Auth is
-- added later, create policies that map auth.jwt()->>'email' to profiles.email
-- and restrict admin/HR/trainer mutations by profiles.role.
--
-- Foreign keys are intentionally deferred for this transitional migration
-- because the current single-page app can create orphaned records when admins
-- delete courses/modules, and old localStorage collections are imported in
-- parallel. After the current data is cleaned and Auth/server authorization is
-- added, add FK constraints for course_id, module_id, quiz_id, and email.
