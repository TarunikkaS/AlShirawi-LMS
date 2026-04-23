# Al Shirawi Equipment Co Learning Management System

This repository contains a frontend-only LMS prototype for Al Shirawi Equipment Co.

The project is intentionally built as one simple HTML file so it can be opened locally, reviewed easily, and demonstrated without any backend setup.

## Current Prototype Scope

This version is a single-file local prototype.

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
- Browser `localStorage` for prototype persistence

There is currently:

- No backend API
- No server-side authentication
- No production database
- No build system
- No Node.js app
- No Firebase or Supabase
- No cloud deployment configuration

## How to Run Locally

Open this file in a browser:

```text
AlShirawi_LMS copy.html
```

No installation is required.

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

All data is stored only in the browser using `localStorage`.

This includes:

- Created user accounts
- Roles
- Courses
- Modules
- Assignments
- Quiz attempts
- Learner progress
- Certificates

This means data is local to the browser and device where the file is opened.

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

Before going into production, this prototype should be converted from a browser-only HTML file into a proper company-hosted LMS application.

Recommended future architecture:

- Host the application on the company's approved server or cloud environment
- Use company-managed authentication, preferably integrated with company email or SSO
- Move all LMS data from browser `localStorage` into a secure production database
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

- Replace `localStorage` with a secure database
- Add backend APIs
- Add secure authentication
- Add role-based authorization on the server
- Add database schema for users, courses, modules, assignments, quizzes, progress, and certificates
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
