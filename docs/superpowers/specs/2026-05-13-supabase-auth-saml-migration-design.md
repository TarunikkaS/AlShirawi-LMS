# Supabase Auth SAML Migration Design

**Date:** 2026-05-13
**Project:** Al Shirawi LMS
**Status:** Approved

## Overview

Migrate the LMS from a custom email-only session system (localStorage + no password) to Supabase Auth with full SAML SSO via Google Workspace as the identity provider. Requires Supabase Pro.

## Goals

- Users authenticate via Google Workspace SAML — no password, no self-registration
- API routes are secured with JWT verification (closes current open-API security gap)
- `profiles` table and all existing data are unchanged
- Superadmin role is driven by the `profiles.role` column, not hardcoded emails

## Out of Scope

- Changes to course, module, quiz, or certificate logic
- SCIM provisioning
- Magic link or email OTP fallback

---

## Architecture

### 1. Supabase Auth (new)

Supabase Auth is enabled on the existing project. A SAML SSO provider is configured pointing at Google Workspace. Supabase handles the SAML assertion validation and issues a signed JWT to the browser via `supabase-js`.

### 2. Login Page (changed)

The email input, password-free login flow, and "Create Account" form are removed. Replaced with a single **"Sign in with Google Workspace"** button. On click, calls:

```js
supabase.auth.signInWithSSO({ domain: 'equipment.ae' })
```

Supabase redirects the browser to Google. After authentication, Google sends the SAML assertion back to Supabase's callback URL.

A new `/auth/callback` route (a minimal HTML page) calls `supabase.auth.getSession()` to exchange the URL fragment for a JWT, then redirects to the main LMS.

### 3. Session Management (changed)

| Before | After |
|--------|-------|
| `localStorage` with email + expiry timestamp | Supabase-managed JWT via `supabase-js` |
| `readSession()` / `setSession()` helpers | `supabase.auth.getSession()` / `supabase.auth.onAuthStateChange()` |
| `store.clear('session')` on logout | `supabase.auth.signOut()` |

The `supabase-js` library is loaded via CDN in the HTML file.

### 4. API Auth Middleware (new)

New shared module `api/auth.js`:

- Extracts `Authorization: Bearer <jwt>` from the request header
- Verifies the JWT signature using `SUPABASE_JWT_SECRET`
- Returns the decoded email from token claims
- Returns HTTP 401 if the header is missing or the token is invalid/expired

All 5 API routes call this middleware at the top before any DB operation:
- `api/lms-data.js`
- `api/video-upload.js`
- `api/fetch-image.js`
- `api/generate-modules.js`
- `api/generate-quiz.js`

The frontend replaces the `X-LMS-Session-Email` header with `Authorization: Bearer <jwt>` on all API calls.

### 5. Profile Linking & Access Control

- `profiles` table is **unchanged** — no new columns
- After SAML login, the verified JWT email is looked up in `profiles`
- If no profile row exists → API returns 403 → frontend shows: *"Your LMS account hasn't been set up yet. Contact your admin."* → user is signed out
- Admin creates profile rows via the existing Admin panel (unchanged flow)
- Any profile with `role = 'superadmin'` gets superadmin access

### 6. Super Admin

The hardcoded `SUPER_EMAIL` constant is removed. Superadmin access is determined solely by `profiles.role = 'superadmin'`.

Initial superadmin profiles to be inserted via SQL:
- `tarunikka.u@equipment.ae`
- `uday.bala@equipment.ae`

---

## Data Flow

```
User clicks "Sign in with Google Workspace"
  → supabase.auth.signInWithSSO({ domain: 'equipment.ae' })
  → Browser redirected to Google Workspace login
  → Google authenticates user, sends SAML assertion to Supabase
  → Supabase validates assertion, creates/updates auth.users entry
  → Browser redirected to /auth/callback
  → supabase.auth.getSession() exchanges fragment for JWT
  → Browser redirected to main LMS
  → App calls supabase.auth.getSession() on load
  → JWT email looked up in profiles table
  → If profile exists → LMS loads
  → If profile missing → "Contact your admin" message, sign out
```

---

## Environment Variables

| Variable | Source | Where |
|----------|--------|-------|
| `SUPABASE_JWT_SECRET` | Supabase → Settings → API → JWT Secret | Vercel env vars |
| `SUPABASE_URL` | Already exists | Already in Vercel |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API → anon key | Vercel env vars (new) |
| `SUPABASE_SERVICE_ROLE_KEY` | Already exists | Already in Vercel |

---

## Setup Steps (Outside Code)

1. **Upgrade Supabase project to Pro**
2. **Supabase Dashboard** → Authentication → SSO Providers → Add provider → get ACS URL + Entity ID
3. **Google Workspace Admin Console** → Apps → Web and mobile apps → Add custom SAML app → paste ACS URL + Entity ID → map `email` attribute → enable for org
4. **Vercel** → Add `SUPABASE_JWT_SECRET` and `SUPABASE_ANON_KEY` env vars
5. **Supabase SQL editor** → Insert superadmin profile rows for both superadmin emails

---

## Error Handling

| Scenario | Behaviour |
|----------|-----------|
| SAML login fails at Google | Google shows error; user stays on login page |
| JWT missing on API call | 401 returned; frontend redirects to login |
| JWT expired | 401 returned; frontend calls `supabase.auth.signOut()` then redirects to login |
| Profile not found after SAML login | 403 returned; frontend shows "Contact your admin" and signs out |
| Supabase Auth down | Login button shows error state |

---

## Files Changed

| File | Change |
|------|--------|
| `AlShirawi_LMS copy.html` | Replace login UI + session logic with supabase-js auth |
| `api/auth.js` | New — JWT verification middleware |
| `api/lms-data.js` | Add auth middleware call |
| `api/video-upload.js` | Add auth middleware call |
| `api/fetch-image.js` | Add auth middleware call |
| `api/generate-modules.js` | Add auth middleware call |
| `api/generate-quiz.js` | Add auth middleware call |
| `auth-callback.html` | New — handles SAML redirect, exchanges fragment for JWT |

---

## What Is Not Changed

- `supabase/schema.sql` — no schema changes
- `profiles` table structure — unchanged
- Admin panel user creation flow — unchanged
- Course, module, quiz, certificate, progress logic — unchanged
- All existing Supabase DB read/write logic in `api/lms-data.js` — unchanged
