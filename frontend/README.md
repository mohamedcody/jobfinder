# JobFinder Frontend

Next.js (App Router) frontend for JobFinder with a complete authentication flow integrated with Spring Boot.

## Auth Features

- Register (`/register`)
- Login (`/login`)
- Forgot Password (`/forgot-password`)
- Reset Password with OTP (`/reset-password`)
- Verify Email with OTP (`/verify-email`)

## Tech Stack

- Next.js + TypeScript + Tailwind CSS
- `react-hook-form` + `zod` for form validation
- `axios` for API requests with JWT interceptor
- `sonner` for success/error toasts

## Environment Variables

Create `.env.local` in `frontend/`:

```env
NEXT_PUBLIC_AUTH_API_URL=http://localhost:8080/api/auth
```

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Notes

- JWT is stored client-side in `localStorage` for this client-only implementation.
- The axios client automatically attaches `Authorization: Bearer <token>` to outgoing requests when a valid token exists.
