# AGENTS.md

## Project

Daily Quest is a client-only habit tracker built with React, TypeScript, and Vite. The production site is hosted at `https://l-prokopec.github.io/cloud/`.

## Commands

- `npm run dev` — local development server
- `npm run test` — Vitest suite
- `npm run typecheck` — strict TypeScript check
- `npm run lint` — ESLint
- `npm run build` — production build to `dist/`

Run all four quality commands before committing changes.

## Architecture

- Keep domain types in `src/types.ts`.
- Keep date, scheduling, streak, and statistics logic in pure functions under `src/lib/`.
- Keep browser persistence behind `src/lib/storage.ts`.
- Keep application state and mutations in `src/hooks/useHabitStore.ts`.
- Components should focus on rendering and interaction, not duplicate business rules.
- Add or update tests when changing scheduling, streaks, statistics, or persistence.

## Constraints

- The application must remain client-only: no backend, external database, API keys, or paid services.
- Persist user data in `localStorage`; treat stored data as untrusted input.
- Date keys use local calendar dates in `YYYY-MM-DD` format. Avoid deriving them with `toISOString()` because UTC conversion can shift a local date.
- Preserve responsive behavior, keyboard accessibility, light/dark themes, and reduced-motion support.
- Keep Vite `base` set to `/cloud/` for project Pages deployment.
- The default branch is `master`; pushes to it trigger `.github/workflows/deploy.yml`.
