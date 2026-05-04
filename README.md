# Al Shirawi Equipment Co Learning Management System

This repository contains an LMS prototype for Al Shirawi Equipment Co.

The main frontend is still intentionally built as one simple HTML file, but LMS data persistence now goes through Vercel API routes into Supabase instead of browser-only `localStorage`.

## Current Prototype Scope

This version keeps the existing email-based LMS login flow and uses Supabase for LMS records.

It is suitable for:
- Internal LMS flow demonstrations
- UI and process validation
- HR/admin/learner workflow review
- Early feedback before production planning

It is not yet a production LMS.

## Current Tech Stack

The current project uses:

- HTML
- CSS
- JavaScript
- React 18 via CDN
- Babel via CDN
- Tailwind CSS via CDN
- jsPDF via CDN for certificate PDF download
- Supabase Postgres for LMS persistence
- Vercel Serverless Functions for the data API

There is currently:

- A small Vercel API for LMS data reads/writes
- No server-side authentication
- No Supabase Auth yet
- No build system
- No Node.js app

## How to Run Locally

The Supabase-backed version must be served through Vercel or another server that provides the `/api/lms-data` route. Opening the HTML file directly no longer provides persistent LMS data access:

```text
AlShirawi_LMS copy.html
```

No package install is required for the frontend itself.

## Supabase Setup

1. Create the tables by running:

```text
supabase/schema.sql
```

2. Set these environment variables in Vercel:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

`SUPABASE_SERVICE_ROLE_KEY` must be set only on the server side in Vercel. Do not expose it in browser code.

3. Deploy to Vercel. The root path `/` rewrites to `AlShirawi_LMS copy.html`.

## Main Features in This Prototype

- Company email based account creation
- Learner, trainer, and admin role management
- Course creation
- Module creation
- Course assignment to learners
- Quiz creation and quiz attempts
- Learner course dashboard
- Course view in a separate browser tab
- Video, document, and labeled image support in modules
- Learner progress tracking
- Badge and certificate generation
- Downloadable certificate PDF
- Simulated certificate email-sent status

## Data Storage in Current Version

LMS content records are stored in Supabase tables.

This includes:

- Created user accounts
- Roles
- Courses
- Modules
- Assignments
- Quiz attempts
- Learner progress
- Certificates

The current session remains in browser `localStorage` so the existing login behavior is preserved. Existing LMS records found in old localStorage keys are imported into Supabase the first time the app loads and the matching Supabase table is empty.

The localStorage keys migrated are:

- `alshirawi_lms_v2_users`
- `alshirawi_lms_v2_courses`
- `alshirawi_lms_v2_modules`
- `alshirawi_lms_v2_assignments`
- `alshirawi_lms_v2_assignment_rules`
- `alshirawi_lms_v2_quizzes`
- `alshirawi_lms_v2_progress`
- `alshirawi_lms_v2_quiz_attempts`
- `alshirawi_lms_v2_certificates`

## Privacy and GitHub Protection

The repository does not include a production user database.

Do not commit:

- Exported localStorage data
- Employee data exports
- Screenshots containing employee records
- Database files
- Manually downloaded user records
- Any confidential company training data

The `.gitignore` file includes common patterns for local database/export files.

## Files

- `AlShirawi_LMS copy.html` - the complete LMS frontend prototype
- `LOGO.jpg` - Al Shirawi logo used in the interface
- `.gitignore` - protects local/generated/private files
- `README.md` - project documentation

## Future Production Direction

Before going into production, this prototype should add real authentication and server-side authorization.

Recommended future architecture:

- Host the application on the company's approved server or cloud environment
- Use company-managed authentication, preferably integrated with company email or SSO
- Keep LMS data in Supabase Postgres
- Use role-based backend authorization for admin, trainer, HR, and learner access
- Store training files, images, documents, and videos in approved cloud or company storage
- Add audit logs for account creation, role changes, assignments, quiz attempts, and certificate generation
- Add backup, restore, and retention policies
- Add production security review before employee data is used

## Possible GCP Production Setup

If the company chooses Google Cloud Platform, a future production version could use:

- Cloud Run or App Engine for hosting the LMS application
- Cloud SQL or Firestore for LMS data
- Cloud Storage for training documents, images, videos, and certificates
- Identity Platform, Google Workspace SSO, or company SSO for authentication
- Secret Manager for API keys and configuration
- Cloud Logging and Cloud Monitoring for production logs and health checks
- IAM policies to restrict admin and database access

The current prototype does not connect to GCP yet. GCP should be added only during the production implementation phase.

## Production Readiness Checklist

Before production release, the following should be completed:

- Add Supabase Auth or approved company SSO
- Add secure authentication
- Add role-based authorization on the server
- Tighten Row Level Security policies around authenticated users and roles
- Add file upload storage for module assets
- Add input validation on both frontend and backend
- Add encryption and access control for employee data
- Add audit logging
- Add automated backups
- Add testing
- Add deployment pipeline
- Add company IT/security approval

## Important Note

This repository is a frontend prototype only. It demonstrates how the LMS can look and behave, but it should not be used as the final production system without backend, database, authentication, hosting, and security upgrades.
