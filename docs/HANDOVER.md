# Al Shirawi LMS — Handover & Transfer Guide

**Live site:** https://al-shirawi-lms.vercel.app
**For:** Uday Bala (uday.bala@equipment.ae) — incoming owner
**From:** Tarunikka Unnikrishnan (leaving the company)

---

## 1. The short version

- The LMS is **live and will keep running** on its own.
- To **use and manage** it (add staff, courses, certificates), Uday just logs in — no technical work needed (see Part A).
- To **make code changes or move hosting** off Tarunikka's personal accounts, a technical person follows Part B (one-time, ~30 min).
- ✅ Good news: **no passwords or secret keys are stored in the code/GitHub.** Safe to share the repo.

---

## PART A — For Uday (daily use, no tech skills needed)

1. Go to **https://al-shirawi-lms.vercel.app**
2. Sign in with **uday.bala@equipment.ae** (Google sign-in; only `@equipment.ae` accounts work)
3. You are automatically the **Super Admin** — you can manage all users, courses, assignments, and certificates from inside the app.

That's all that's needed to run the LMS day to day.

---

## PART B — For the technical person (transferring ownership)

The site currently lives on Tarunikka's **personal** GitHub + Vercel. To move it to the company, do this **once**. Best practice: use the shared company account **`lms@equipment.ae`** to own both GitHub and Vercel, so future handovers are just sharing that one login (no re-doing this).

### The transfer steps

1. **Get the code** — clone (or fork) the GitHub repo:
   `https://github.com/TarunikkaS/AlShirawi-LMS`
   (Even simpler: GitHub → repo → Settings → *Transfer ownership* to the company account, so history moves too.)

2. **Make any code changes** you need (optional).

3. **Create / log in to a Vercel account** — ideally with `lms@equipment.ae`.

4. **Import the repo into Vercel** (Vercel → Add New → Project → import the GitHub repo).

5. **Add the environment variables** in Vercel → Settings → Environment Variables (set for **Production**). See the table below.

6. **Deploy.** Vercel auto-deploys on every push to GitHub from then on. Done.

7. Once confirmed working, **delete the old project** from Tarunikka's personal Vercel and remove the repo from her personal GitHub.

### Environment variables to set in Vercel

> ⚠️ The old values **cannot be copied** — Vercel stores them as write-only/encrypted. Generate fresh ones (this is the right thing for a clean handover).

| Variable | Where to get the value |
|---|---|
| `FIREBASE_PROJECT_ID` | `gccin-222609` (not secret) |
| `FIREBASE_STORAGE_BUCKET` | `gccin-222609.firebasestorage.app` (not secret) |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Console → ⚙ Settings → **Service accounts** → *Generate new private key* → paste the **whole JSON** |
| `FIREBASE_CLIENT_EMAIL` | the `client_email` field from that same JSON |
| `FIREBASE_PRIVATE_KEY` | the `private_key` field from that same JSON |
| `GEMINI_API_KEY` | https://aistudio.google.com/apikey (make a new one) |
| `GROQ_API_KEY` | https://console.groq.com/keys (make a new one) |
| `PEXELS_API_KEY` | https://www.pexels.com/api/ (make a new one) |

### 🔴 CRITICAL: keep the SAME Firebase project = keep all the data

- The 5 Firebase values **must come from the existing Firebase project `gccin-222609`** (owned by Noor Khalandar, `noor.k@equipment.ae`).
- This keeps **all existing users, courses, and certificates**.
- ❌ Do **NOT** create a brand-new Firebase project — the LMS would open completely **empty** (data not connected).
- The 3 AI keys (Gemini/Groq/Pexels) can be brand-new — they don't affect data.

### Firebase access
- Ask the owner **Noor (noor.k@equipment.ae)** to add the maintainer + `uday.bala@equipment.ae` under Firebase Console → Settings → **Users and permissions**.

---

## 3. How future code changes work (after transfer)

Once it's on the company GitHub + Vercel:
1. Edit the code (the whole app is one file: `AlShirawi_LMS.html`).
2. Push to GitHub.
3. Vercel **auto-deploys** the new version. No manual deploy needed.

To hand it to the next person later: just give them access to the company GitHub + Vercel (or the shared `lms@equipment.ae` login). **No need to regenerate keys again** — they stay in the company Vercel account.

---

## 4. Security notes

- ✅ No secret keys are committed to GitHub. Verified across full history.
- The Firebase **Web API key** (`AIzaSy...` in `AlShirawi_LMS.html`) is **public by design** — it ships to every browser and is safe. Data is protected by Firebase Security Rules + `@equipment.ae`-only login. (Optional hardening: restrict that key to your domain in Google Cloud Console.)
- The **Super Admin** is set to `uday.bala@equipment.ae` in the code (`SUPER_EMAIL` line in `AlShirawi_LMS.html`). To change it later, edit that line.
- ❌ Never email/chat the secret keys — share via a password manager.
- ❌ Don't delete Tarunikka's personal GitHub/Vercel until the transfer is confirmed working, or the site goes down.

---

## 5. Quick reference — what's where

| System | Detail | Owner today | After transfer |
|---|---|---|---|
| App / hosting | Vercel project `al-shirawi-lms` | Tarunikka (personal) | Company / `lms@equipment.ae` |
| Source code | `github.com/TarunikkaS/AlShirawi-LMS` | Tarunikka (personal) | Company / `lms@equipment.ae` |
| Data + login + files | Firebase project `gccin-222609` | **Noor (already company)** | unchanged ✅ |
| Super Admin | `uday.bala@equipment.ae` | set ✅ | set ✅ |
