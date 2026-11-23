# TAPS Monorepo — Project Instructions

## Repository Structure

The Git repository root is the monorepo root. The React frontend lives in `frontend/`.

- `frontend/src/main.tsx` — React entry point.
- `frontend/src/App.tsx` — primary application component.
- `frontend/src/routes.tsx` — route definitions and client-side role guards.
- `frontend/src/index.css` — global CSS and Tailwind CSS v4 entry point.
- `frontend/package.json` — frontend dependencies and scripts.
- `frontend/pnpm-lock.yaml` — pnpm lockfile.
- `frontend/vite.config.ts` — Vite configuration.
- `backend/` and `database/` are planned; they do not exist yet.

Keep repository-wide documentation and Git configuration in the repository root.

## Toolchain

The root `.mise.toml` specifies Node.js 22 and pnpm 10.34.3. Use compatible versions of Node.js, Vite, and Vitest.

Run frontend commands from the repository root using `--dir frontend`, for example:

- `corepack pnpm@10.34.3 --dir frontend install`
- `corepack pnpm@10.34.3 --dir frontend run dev`
- `corepack pnpm@10.34.3 --dir frontend test`
- `corepack pnpm@10.34.3 --dir frontend run build`

Alternatively, enter `frontend/` and run the corresponding commands there.

## Code Style

The frontend uses React, React Router, TypeScript, Vite, Tailwind CSS v4, Vitest, and Oxfmt.

Follow `frontend/.oxfmtrc.json`. After source changes, run the formatter and relevant checks.

Recommended verification:

1. `corepack pnpm@10.34.3 --dir frontend test`
2. `corepack pnpm@10.34.3 --dir frontend exec tsc --noEmit --noUnusedLocals --noUnusedParameters`
3. `corepack pnpm@10.34.3 --dir frontend run build`
4. `corepack pnpm@10.34.3 --dir frontend exec oxfmt --check src`

## Prototype Boundaries

- Google sign-in is simulated, not a real OAuth integration.
- Administrator demo credentials reside in frontend source and are not suitable for production.
- Client-side route guards are not a substitute for server-side authentication and authorization.
- Workflow reports use browser `sessionStorage`, not a persistent shared database.
- Attachment information currently stores file metadata; actual file storage remains to be implemented.
- Seed records are demonstration data.

## Change Safety

Inspect existing implementation before editing. Keep changes scoped and preserve established UI behavior.

Never commit or push unless explicitly authorized.

## Firebase

The project is `lapor-tutor` (`.firebaserc`). Copy `frontend/.env.example` to
`frontend/.env.local` and fill it from Firebase Console; without it the app
runs in simulation mode and Firebase-backed features are inert.

Security rules live in `firestore.rules` and are the authorization layer.
Client-side checks only decide what to render.

Rules tests require the Firestore emulator, which needs JDK 21 or newer:

```
JAVA_HOME=$(brew --prefix openjdk@21) \
  corepack pnpm@10.34.3 --dir frontend run test:rules:emulator
```

Without the emulator those tests skip rather than fail, so `pnpm test` works
without Java.

Status values come from `frontend/src/shared/domain/report-status.ts`, a direct
translation of Tabel 4.1 and Tabel 4.2 in the proposal. Change the tables first,
then the module — never only the code.

## Security posture

Authorization lives in `firestore.rules`, not in the client. Three invariants
the rules enforce and the emulator tests cover:

- A student can only read their own reports; queries that cannot prove this
  are rejected rather than silently returning other people's data.
- An Administrator cannot act on a report they filed themselves. A student
  promoted to Administrator keeps their old reports, so without this they
  could verify and close their own complaint.
- Text fields have length caps and documents have a field-count cap, so a
  signed-in user cannot exhaust the database quota with oversized writes.

App Check is wired but inert until `VITE_FIREBASE_APPCHECK_SITE_KEY` is set.
Leave it empty locally; set it for any deployment reachable from the internet,
otherwise the web config in the bundle lets anyone call Firestore directly.

The default provider is reCAPTCHA Enterprise, which the Firebase console now
calls Fraud Defense; reCAPTCHA Classic is deprecated there. Enterprise works
on the Spark plan, only with fewer selectable score thresholds. Set
`VITE_FIREBASE_APPCHECK_PROVIDER=v3` only to keep an existing Classic key
working during a migration.

Not covered: per-user write rate limiting, which needs Cloud Functions and
therefore the Blaze plan.
