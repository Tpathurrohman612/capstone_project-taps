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
