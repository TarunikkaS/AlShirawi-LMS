# Al Shirawi Equipment Co LMS

Single-file LMS prototype for Al Shirawi Equipment Co.

## How to Run

Open `AlShirawi_LMS copy.html` in a browser.

The app uses:
- React 18 via CDN
- Babel via CDN
- Tailwind CSS via CDN
- Browser `localStorage` for persistence

No backend, database, build tool, Firebase, or Supabase is required.

## Data and Privacy

User accounts, course assignments, progress, quiz attempts, badges, and certificates are stored only in the browser's `localStorage`.

This repository does not include a user database or exported user records. Do not commit browser exports, screenshots containing employee data, or any manually downloaded user data.

## Main Features

- Account creation from the login page using company email
- Admin role management for learner, trainer, and admin access
- Course, module, quiz, and assignment management
- Video, document, and labeled image support in modules
- Learner course view in a separate browser tab
- Learner progress, quizzes, badges, and downloadable certificates

## Files

- `AlShirawi_LMS copy.html` - complete LMS app
- `LOGO.jpg` - Al Shirawi logo used by the app
