# AGENTS.md

## Cursor Cloud specific instructions

This is a **Next.js 16** (App Router) project called "run-with-me" using TypeScript, Tailwind CSS v4, and React 19. No database, Docker, or external services are required.

### Key commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` (port 3000) |
| Lint | `npm run lint` (ESLint 9) |
| Build | `npm run build` |
| Production start | `npm run start` |

See `README.md` and `package.json` for full details.

### Notes

- Uses `package-lock.json` — always use **npm** (not yarn/pnpm/bun).
- No test framework is configured yet; there are no automated tests to run.
- No environment variables or `.env` files are needed.
- The dev server uses Turbopack and supports Fast Refresh for instant feedback on file edits.
