# JobFinder

## Project Overview
JobFinder is a full-stack, AI-powered job search platform designed to match users with relevant job opportunities using semantic search and automated resume parsing. The platform includes an autonomous job scraper (via Apify) and utilizes Google's Gemini API for CV extraction and job summarization.

## Main Features
- **AI-Powered CV Parsing:** Upload a PDF resume, and the system extracts structured data (skills, experience, education) using the Gemini API.
- **Semantic Job Matching:** Uses `pgvector` and Gemini embeddings to find jobs that perfectly match a user's profile based on semantic meaning, not just keyword matching.
- **Autonomous Job Scraping:** Admin-triggered scraper that fetches jobs from LinkedIn (via Apify) and automatically generates AI summaries.
- **Robust Authentication:** Secure JWT-based authentication with email OTP verification, brute-force protection, and account lockouts.
- **Daily Job Alerts:** Scheduled daily email digests of top-matching jobs tailored to each user.
- **Saved Jobs:** Users can save jobs, add notes, and track opportunities.

## Technology Stack
- **Backend:** Java 17, Spring Boot 3.5.10, Spring Security, Hibernate/JPA, Resilience4j, GraphQL.
- **Database:** PostgreSQL with `pgvector` extension, managed via Flyway migrations.
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4, React Hook Form, Zod.
- **External APIs:** Google Gemini (AI extraction/embeddings), Apify (Scraping).
- **Infrastructure:** Docker Compose, Nginx, Prometheus, Grafana.

## Project Structure
- `/backend`: Spring Boot Java backend application.
- `/frontend`: Next.js React frontend application.
- `/infra`: Infrastructure configurations (Nginx reverse proxy, Prometheus, Grafana).
- `docker-compose.yml`: Multi-container orchestration.

## Requirements
- Java 17
- Node.js 24+
- Docker and Docker Compose
- A PostgreSQL instance with the `pgvector` extension (e.g., Supabase)

## Local Development Setup

### Environment Variables
Create `.env` files based on the provided examples.
**Backend (`backend/.env` or system variables):**
```properties
DB_URL=jdbc:postgresql://your-host:6543/postgres
DB_USER=your-db-username
DB_PASSWORD=your-db-password
MY_SECRET_KEY=your-base64-encoded-256-bit-key-here
MY_EXPIRATION_TIME=604800000
MY_APIFY_TOKEN=your-apify-api-token
GEMINI_API_KEY=your-gemini-api-key
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
FRONTEND_URL=http://localhost:3000
```
**Frontend (`frontend/.env`):**
```properties
NEXT_PUBLIC_AUTH_API_URL=/api/auth
NEXT_PUBLIC_JOBS_API_URL=/api/jobs
NEXT_PUBLIC_SAVED_JOBS_API_URL=/api/saved-jobs
BACKEND_ORIGIN=http://localhost:8080 # (Required at build time for rewrites)
```

### Running the Application (Locally)
1. **Backend:** 
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Docker Setup
To run the entire stack (Backend, Frontend, Nginx, Prometheus, Grafana):
```bash
docker-compose up -d --build
```
*Note: Ensure your database is running externally as it is not included in the compose file.*

### Running Tests
**Backend:**
```bash
cd backend
./mvnw test
```
*Note: Test coverage is currently limited. Expanding the test suite is a planned priority.*

## API Overview
The backend exposes REST APIs under `/api/` and a GraphQL endpoint at `/graphql`.
- **Auth:** `/api/auth/register`, `/api/auth/login`, `/api/auth/verify-email`
- **Jobs:** `/api/jobs`, `/api/jobs/filter`
- **Saved Jobs:** `/api/saved-jobs`
- **User Profile:** `/api/users/profile`
- **CV Parsing:** `/api/cv/upload`

## Authentication Overview
Stateless authentication using JWTs. The flow requires users to verify their email via a 6-digit OTP before logging in. Failed login attempts are tracked, resulting in a temporary account lockout to prevent brute-force attacks.

## Security Notes
- Passwords are hashed using BCrypt.
- APIs are protected by a JWT Authentication filter.
- `/api/auth` endpoints are protected by an in-memory Rate Limiter (20 req/min).
- Input validation is enforced via `@Valid` and Bean Validation.
- CORS is restricted to the configured `FRONTEND_URL`.

## Known Limitations & Missing Features
- The rate limiter is currently in-memory and not suitable for multi-instance distributed deployments.
- Test coverage is critically low for core business logic (Auth, Profile, Saved Jobs).
- The `CvUploadController` currently blocks a reactive WebFlux thread, which may limit scalability during high traffic.
- Semantic matching logic is duplicated across multiple services.
