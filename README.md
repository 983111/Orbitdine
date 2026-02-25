# OrbitDine

OrbitDine is a QR-based restaurant management platform with real-time ordering, kitchen workflows, and owner analytics.

## Run locally

**Prerequisites:** Node.js, PostgreSQL, Redis, Firebase project

1. Install dependencies:
   `npm install`
2. Copy environment values:
   `cp .env.example .env.local`
3. Configure `DATABASE_URL`, `REDIS_URL`, and Firebase variables in `.env.local`.
4. Start the app:
   `npm run dev`

## Authentication

OrbitDine uses Firebase Authentication for staff login. Configure client-side Firebase keys (`VITE_FIREBASE_*`) and backend Admin credentials (`FIREBASE_SERVICE_ACCOUNT_PATH` or `FIREBASE_PROJECT_ID` + `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY`).

Assign each staff user a Firebase custom claim for role authorization:

- `role: "manager"`
- `role: "owner"`

Login at `/login` to access `/manager/*` or `/owner` routes based on the role claim.
