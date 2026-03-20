# AGENTS.md

## Cursor Cloud specific instructions

This is a React + TypeScript + Vite frontend SPA for the **DASHQARD** gift card platform. There is no backend in this repo; the app depends on a remote REST API configured via `.env` variables (`VITE_DEVELOPMENT_BASE_URL`, `VITE_STAGING_BASE_URL`, etc.).

### Quick reference

| Task               | Command                                 |
| ------------------ | --------------------------------------- |
| Dev server         | `npm run dev` (Vite, default port 5173) |
| Lint               | `npm run lint`                          |
| Format check       | `npm run format:check`                  |
| Tests (watch)      | `npm run test`                          |
| Tests (single run) | `npm run test:run`                      |
| Build              | `npm run build`                         |

### Notes

- The pre-commit hook (`npm run lint && npm run format:check`) runs via Husky. Husky is configured by `npm install` (the `prepare` script).
- Tests use Vitest with jsdom — no browser or backend required. There are ~4 pre-existing test failures as of initial setup.
- The app connects to a staging backend API already configured in `.env`. No additional secrets are needed for local dev/browsing.
- Tailwind CSS v4 is used via `@tailwindcss/vite` plugin — no separate `tailwind.config` file exists.
- Path alias `@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`).
