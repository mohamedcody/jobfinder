# AGENTS.md — JobFinder

## Big picture
- This repo is a **two-app monorepo**: `backend/` is a Spring Boot API, and `frontend/` is a Next.js 16 App Router app.
- Main user flow: auth happens in `frontend/src/app/(auth)/*` → JWT is stored in `frontend/src/lib/auth/token-storage.ts` → protected pages like `frontend/src/app/jobs/page.tsx` read session state with `useAuthSession()`.
- Backend auth and jobs live under `backend/src/main/java/jobfinder/controller/` with services in `servics/implemention` and `servics/interfaces`.

## Run / debug workflow
- Fastest local start: `./run.sh` from repo root; it starts backend on `8080`, frontend on `3000`, and creates `frontend/.env.local` if missing.
- Manual backend: `cd backend && ./mvnw spring-boot:run`.
- Manual frontend: `cd frontend && npm install && npm run dev`.
- Backend build: `cd backend && ./mvnw clean package -DskipTests`.
- Frontend checks: `cd frontend && npm run build` and `npm run lint`.
- Prefer `run.sh` or the explicit `backend/` and `frontend/` commands above; the root `package.json` is not the canonical workflow and its `server/client` paths are stale.

## Integration points
- Backend is secured with JWT + stateless Spring Security (`backend/src/main/java/jobfinder/config/SecurityConfig.java`).
- Public backend surfaces: `/api/auth/**`, `/api/jobs/**`, `/graphql/**`, `/v3/api-docs/**`, and Swagger UI.
- Job search uses cursor pagination and the `/api/jobs/filter` endpoint; the frontend calls it through `frontend/src/lib/jobs/jobs-service.ts`.
- Required backend env vars come from `backend/src/main/resources/application.properties`: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `MY_APIFY_TOKEN`, `MY_SECRET_KEY`, `MY_EXPIRATION_TIME`, `MAIL_USERNAME`, `MAIL_PASSWORD`.

## Codebase conventions
- Keep API request/response types in `frontend/src/lib/**/types.ts` and transport logic in `frontend/src/lib/**/service.ts`.
- Reuse `getApiErrorMessage()` / `isRequestCanceled()` for Axios errors instead of duplicating toast logic.
- Use `useAuthSession()` for auth gating; it syncs token changes across tabs via `storage` + a custom event.
- Jobs UI is split into small components under `frontend/src/components/jobs/` (`jobs-list.tsx`, `job-search-filter.tsx`, `job-card.tsx`, `jobs-navbar.tsx`).
- Backend package names are intentionally mixed with the existing typo `servics`; follow the current package structure unless doing a broad refactor.

## Useful file references
- Backend endpoints: `backend/src/main/java/jobfinder/controller/AuthController.java`, `JobController.java`
- Security/config: `backend/src/main/java/jobfinder/config/SecurityConfig.java`
- Jobs API client: `frontend/src/lib/jobs/jobs-service.ts`
- Jobs page composition: `frontend/src/app/jobs/page.tsx`
- Search/filter UI: `frontend/src/components/jobs/job-search-filter.tsx`

## When changing features
- Preserve the cursor-pagination contract (`lastId`, `size`, `hasNext`, `nextCursor`).
- Keep external URLs sanitized with `normalizeExternalUrl()` in job cards.
- If you change auth or session flow, update both token storage and `useAuthSession()` together.

