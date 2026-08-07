# PROJECT_KNOWLEDGE.md

# 1. Project Overview
- **Project Name**: JobFinder
- **One sentence summary**: An AI-powered, autonomous job aggregation and matching SaaS platform.
- **Detailed description**: JobFinder is a comprehensive full-stack application that acts as an intelligent career assistant. It allows users to upload their CVs, which are parsed via AI to build a rich profile. The platform autonomously scrapes external job boards (like LinkedIn) daily for roles matching users' skills, scores the jobs using an AI matching engine, and sends out curated daily email alerts for top matches.
- **Main business idea**: Automate the job search process by aggregating roles based on actual user demand, parsing profiles automatically via AI, and pushing highly relevant jobs directly to candidates' inboxes.
- **What problem it solves**: Reduces the manual effort of job searching and profile building. Candidates no longer need to scour multiple sites daily or manually fill out extensive profile forms.
- **Who the target users are**: Job seekers, professionals looking for career advancement, and passive candidates who want to be notified of perfect opportunities.
- **Business goals**: Increase user engagement through accurate AI matching, grow a database of candidate profiles, and eventually monetize through premium candidate insights or employer job postings.
- **SaaS type**: B2C (Business-to-Consumer) for job seekers. Potential future B2B (Business-to-Business) for recruiters.
- **Industry**: HR Tech / Recruitment.
- **Current project maturity**: MVP / Beta phase. Core functionalities (Auth, Scraping, AI Parsing, Matching, Alerting) are implemented, with local infrastructure setup (Docker, Nginx, Prometheus, Grafana).

---

# 2. Tech Stack

**Frontend**:
- Framework: Next.js 16.2.6 (App Router)
- UI Library: React 19
- Styling: Tailwind CSS v4, Radix UI (Primitives)
- Animation: Framer Motion
- Forms & Validation: React Hook Form, Zod
- Data Fetching: Axios
- Notifications: Sonner (Toasts)
- Icons: Lucide React

**Backend**:
- Framework: Spring Boot 3.5.10 (Java 17)
- Web: Spring Web (REST), Spring WebFlux (WebClient for APIs), Spring GraphQL
- Documentation: Springdoc OpenAPI (Swagger)
- Resilience: Resilience4j Circuit Breaker
- PDF Processing: Apache PDFBox

**Database**:
- Engine: PostgreSQL
- ORM: Spring Data JPA, Hibernate
- Migrations: Flyway

**Authentication & Security**:
- Standard: Spring Security
- Tokens: JWT (jjwt)
- Verification: Email OTPs
- Rate Limiting: Custom Filters & Login Attempt Tracker

**Cloud & AI Services**:
- AI Provider: Google Gemini AI (CV Parsing, Job Summarization)
- Automation/Scraping: Apify (LinkedIn Scraper)
- Storage: Currently Local (Database)

**Email**:
- Provider: SMTP (Spring Boot Starter Mail)

**Deployment & Containerization**:
- Container Engine: Docker
- Orchestration: Docker Compose
- Reverse Proxy: Nginx
- Monitoring: Prometheus, Grafana, Spring Boot Actuator

---

# 3. Project Structure

- `/backend` (Spring Boot Java Application)
  - `src/main/java/jobfinder/`
    - `config/`: Configurations for Security, CORS, Async processing, and Data Auditing.
    - `controller/`: Exposes REST endpoints (`AuthController`, `JobController`, `CvUploadController`, etc.).
    - `model/`: Contains Database `entity` classes and Data Transfer Objects (`dto`).
    - `repository/`: Spring Data JPA interfaces for database interaction.
    - `services/`: Business logic.
      - `ServiceAi/`: Interacts with Google Gemini (`AiService`, `CvAiExtractionService`, `GeminiApiClient`).
      - `implementation/`: Core logic (`AuthService`, `AutonomousJobScraperService`, `JobAlertScheduler`, `JobMatchingService`).
    - `filter/`: Security and rate-limiting filters (`JwtAuthenticationFilter`, `RateLimitFilter`).
    - `exception/`: Global exception handling and custom error definitions.
- `/frontend` (Next.js Application)
  - `src/app/`: Uses the Next.js App Router paradigm.
    - `(auth)/`: Routes for authentication (login, register, forgot-password, reset-password, verify-email).
    - `dashboard/`: Logged-in user homepage.
    - `jobs/`: Job listing and search views.
    - `profile/`: User profile management.
    - `saved/`: User's bookmarked/saved jobs.
    - `settings/`: Account and alert configuration.
- `/infra` (Infrastructure configs)
  - `nginx/`: Nginx proxy configurations.
  - `prometheus/`: Metrics scraping configurations.
  - `grafana/`: Dashboard provisioning.
- `docker-compose.yml`: Orchestrates the backend, frontend, proxy, and monitoring tools.

**Connection Flow**:
Users access the app via Nginx (port 80/443), which routes traffic to the Next.js Frontend or Spring Boot Backend based on the path. The Backend connects to the PostgreSQL DB, sends emails via an external SMTP, triggers Apify via WebClient, and communicates with Gemini AI for NLP tasks.

---

# 4. System Architecture

**Request Flow**:
- **Frontend → Backend → Database**: Frontend makes REST/Axios calls to backend controllers (e.g., `/api/jobs`). Controllers delegate to services, which use repositories to fetch/save data in PostgreSQL.

**Authentication Flow**:
- User submits credentials → `AuthController` validates → `AuthService` checks hashes → Returns JWT.
- Subsequent requests include JWT in `Authorization: Bearer` header. `JwtAuthenticationFilter` validates token before reaching controllers.

**File Upload (CV) Flow**:
- User uploads PDF → `CvUploadController` receives Multipart File.
- `PdfParsingService` extracts raw text.
- `CvAiExtractionService` sends text to Gemini AI with a strict JSON schema prompt.
- Resulting JSON is mapped to `UserProfile` entities and saved to the DB.

**Automation & Scraping Flow**:
- `AutonomousJobScraperService` runs `@Scheduled` every 24 hours.
- It queries the DB for unique job titles currently held by users (to optimize API usage).
- It triggers an Apify LinkedIn scraper actor via REST.
- It polls for completion, fetches results, maps them to `JobEntity` and `CompanyEntity`, checking for duplicates before persisting.

**Notification & Match Flow**:
- `JobAlertScheduler` runs daily at 09:00.
- Fetches active jobs from the last 7 days.
- Iterates over users opted-in to email alerts.
- `JobMatchingService` scores user profiles against jobs.
- High-scoring jobs (> user's minimum threshold) are batched.
- `EmailNotificationService` formats and sends an HTML digest.

---

# 5. Features

1. **User Authentication & Management**
   - *Purpose*: Secure user access.
   - *Business value*: Protects user data and provides personalized experiences.
   - *Files*: `AuthController`, `AuthService`, `User`, `JwtAuthenticationFilter`, `OtpService`.
   - *Current status*: Implemented. Includes OTP email verification and brute-force lockouts.
   - *Missing parts*: OAuth Providers (Google/Github).

2. **AI CV Parsing**
   - *Purpose*: Auto-fill user profiles from PDF resumes.
   - *Business value*: Drastically reduces friction during onboarding.
   - *Files*: `CvUploadController`, `PdfParsingService`, `CvAiExtractionService`.
   - *Current status*: Implemented. Uses Gemini API.
   - *Missing parts*: Word doc support.

3. **Autonomous Job Scraping**
   - *Purpose*: Continuously populate the platform with fresh, relevant jobs.
   - *Business value*: Keeps the platform useful without manual admin data entry.
   - *Files*: `AutonomousJobScraperService`, `AutonomousJobsScraperController`.
   - *Current status*: Implemented via Apify, with circuit breaking for quota limits.
   - *Missing parts*: Webhook notification (currently uses polling).

4. **Smart Job Matching & Daily Alerts**
   - *Purpose*: Deliver personalized job recommendations.
   - *Business value*: Retains users by passively bringing value to their inbox.
   - *Files*: `JobAlertScheduler`, `JobMatchingService`, `EmailNotificationService`.
   - *Current status*: Implemented.
   - *Missing parts*: None.

5. **Job Board & Search**
   - *Purpose*: Allow users to actively search for roles.
   - *Business value*: Core functional requirement for a job portal.
   - *Files*: `JobController`, `JobService`.
   - *Current status*: Implemented.
   - *Missing parts*: None.

6. **Job Saving / Bookmarking**
   - *Purpose*: Users can shortlist roles.
   - *Business value*: Improves user experience and provides signals for better matching.
   - *Files*: `SavedJobController`, `SavedJobService`.
   - *Current status*: Implemented.
   - *Missing parts*: None.

7. **AI Job Summarization**
   - *Purpose*: Provide quick tl;dr of long job descriptions.
   - *Business value*: Saves candidate time.
   - *Files*: `JobController`, `AiService`.
   - *Current status*: Implemented.
   - *Missing parts*: None.

---

# 6. User Roles

1. **USER**
   - *Permissions*: Can login, upload CV, view jobs, save jobs, manage profile, configure email alerts.
   - *Capabilities*: Core consumer of the platform.
   - *Restrictions*: Cannot trigger scrapers manually, cannot access admin metrics.

2. **ADMIN**
   - *Permissions*: Everything USER can do + infrastructure access.
   - *Capabilities*: Access Swagger UI (`/swagger-ui/**`), access GraphQL console (`/graphiql/**`), manually trigger scraping endpoints.
   - *Restrictions*: None.

---

# 7. Database

- **`app_users` (User)**
  - *Purpose*: Core identity table.
  - *Relationships*: One-to-One with UserProfile, UserPreference, EmailAlertSetting. One-to-Many with UserSkill, UserInteraction, OtpCode.
  - *Fields*: id, email, password, role, failed_attempts, lock_time, enabled, email_verified.
- **`UserProfile`**
  - *Purpose*: Resume summary details.
  - *Relationships*: Belongs to User.
  - *Fields*: bio, currentJobTitle, city, country, yearsOfExperience.
- **`CompanyEntity`**
  - *Purpose*: Employer details.
  - *Relationships*: One-to-Many with jobs.
  - *Fields*: id, name, logo_url.
- **`jobs` (JobEntity)**
  - *Purpose*: Stores job data.
  - *Relationships*: Belongs to Company. One-to-Many with JobSkill.
  - *Fields*: id, title, location, employment_type, description, ai_summary, job_url, salary_range, source, scraped_at, is_active.
- **`Skill`**
  - *Purpose*: Global dictionary of skills.
- **`JobSkill`**
  - *Purpose*: Maps Jobs to Skills (Many-to-One).
- **`UserSkill`**
  - *Purpose*: Maps Users to Skills.
  - *Fields*: proficiencyScore, yearsOfExperience.
- **`Education`**
  - *Purpose*: User's educational background.
  - *Fields*: degree, institution, fieldOfStudy, startYear, endYear, grade.
- **`WorkExperience`**
  - *Purpose*: User's past jobs.
  - *Fields*: companyName, jobTitle, description, startDate, endDate, isCurrent.
- **`SavedJob`**
  - *Purpose*: Tracks bookmarked jobs.
- **`UserPreference`**
  - *Purpose*: Job search preferences (locations, roles).
- **`EmailAlertSetting`**
  - *Purpose*: Email notification configs.
  - *Fields*: minMatchScore, optedIn.
- **`OtpCode`**
  - *Purpose*: Temporary codes for validation.
- **`UserInteraction`**
  - *Purpose*: Analytical tracking of user behavior on jobs.

---

# 8. APIs

*Base URL: `/api`*

**Auth (`/api/auth`)**
- `POST /register`: Register new user. Unauthenticated.
- `POST /login`: Authenticate and receive JWT. Unauthenticated.
- `POST /verify-email`: Submit OTP to verify. Unauthenticated.
- `POST /forgot-password`: Request reset OTP. Unauthenticated.
- `POST /reset-password`: Set new password with OTP. Unauthenticated.
- `POST /resend-verification-otp`: Re-trigger OTP email. Unauthenticated.

**Jobs (`/api/jobs`)**
- `GET /`: List paginated jobs. Auth required.
- `GET /search`: Search by keyword. Auth required.
- `GET /filter`: Advanced filter (location, type). Auth required.
- `POST /{id}/summarize`: Generate AI summary of job. Auth required.

**CV (`/api/cv`)**
- `POST /upload`: Upload PDF (multipart/form-data) to extract profile data. Auth required.

**Saved Jobs (`/api/saved-jobs`)**
- `GET /`: Get all saved jobs for user. Auth required.
- `POST /{jobId}`: Save a job. Auth required.
- `DELETE /{jobId}`: Unsave a job. Auth required.
- `GET /{jobId}/status`: Check if job is saved. Auth required.
- `POST /status/batch`: Check status of multiple jobs. Auth required.

**Email Alerts (`/api/email-alerts`)**
- `GET /`: Get user's alert settings. Auth required.
- `PUT /`: Update alert settings. Auth required.
- `POST /test`: Admin test endpoint. Auth required.

**Scraper (`/api/scraper`)**
- `POST /trigger`: Manually start Apify scraper. Admin only.

**Users (`/api/users`)**
- `GET /`: Get current user profile. Auth required.
- `PUT /`: Update user profile. Auth required.
- `GET /{userId}`: Get specific user profile. Auth required.

---

# 9. Frontend Pages

- **`/(auth)/login`**: User login form. Components: LoginForm. Interactions: Logs user in via POST `/api/auth/login`.
- **`/(auth)/register`**: Registration form. Components: RegisterForm. Interactions: Registers user via POST `/api/auth/register`.
- **`/(auth)/verify-email`**: OTP input form. Interactions: Verifies account via POST `/api/auth/verify-email`.
- **`/(auth)/forgot-password` & `reset-password`**: Account recovery flows.
- **`/dashboard`**: User homepage showing stats and recent matches.
- **`/jobs`**: Main job search interface with filters and listing components. Connects to GET `/api/jobs`. User interacts by filtering and viewing descriptions.
- **`/profile`**: Form to view and edit UserProfile. Features CV upload dropzone. Connects to `/api/users` and `/api/cv/upload`.
- **`/saved`**: Grid/List of bookmarked jobs. Connects to `/api/saved-jobs`.
- **`/settings`**: Form to tweak alert configuration. Connects to `/api/email-alerts`.

---

# 10. Business Logic

- **Smart Scraping Strategy**: The scraper does not blindly search LinkedIn. It aggregates the `currentJobTitle` of active users from the database and only scrapes those keywords to conserve Apify API credits.
- **Company De-duplication**: When scraping, the backend creates a fast lookup map of company names to prevent duplicate inserts and database integrity constraints.
- **AI Extraction Confidence**: Gemini AI is forced to return strict JSON using a predefined prompt schema. If it fails, custom exception handling (`MalformedAiResponseException`) catches formatting errors without crashing the thread.
- **Job Matching Algorithm**: Uses a scoring mechanism comparing User Skills vs Job Skills, Location preferences, and Experience levels. Jobs must score higher than the user's configured `minMatchScore` to trigger an email.

---

# 11. Security

- **Authentication**: Handled via stateless JSON Web Tokens (JWT).
- **Authorization**: Role-based access control via Spring Security (`SecurityConfig`), enforcing method-level security.
- **Password Policy**: Passwords are hashed via BCrypt algorithm.
- **Encryption**: Standard TLS over Nginx (port 443).
- **Validation**: Jakarta Validation used across Controllers for RequestBodies.
- **Brute Force Protection**: `LoginAttemptService` tracks failed logins and temporarily locks accounts after a threshold.
- **Rate Limiting**: `RateLimitFilter` prevents endpoint spamming (DDoS mitigation).
- **CORS**: Configured in `CorsConfig` to allow specific frontend domains.
- **Potential Security Issues**: Admin endpoints (like `/scraper/trigger`) must ensure strict `@PreAuthorize("hasRole('ADMIN')")` at the method level to prevent unauthorized scraping triggers if not strictly configured in `SecurityConfig`.

---

# 12. External Services

- **Google Gemini AI**: Used for NLP tasks (CV JSON extraction, Job description summaries).
- **Apify**: Runs headless browser automation to scrape LinkedIn job postings.
- **SMTP Server**: Standard SMTP (e.g., Gmail, SendGrid) to send OTPs and Job Alerts.
- **Docker / Prometheus / Grafana**: Local monitoring and container orchestration.
- **Cloudinary / Firebase / Stripe / GitHub / n8n**: Not Implemented.

---

# 13. Environment Variables

**Backend (`.env`)**
- `DB_URL`: PostgreSQL connection string (jdbc URL).
- `DB_USER`: DB username.
- `DB_PASSWORD`: DB password.
- `MY_SECRET_KEY`: Long, secure base64 string for JWT signing. Must remain secret.
- `MY_EXPIRATION_TIME`: JWT validity duration in MS.
- `MY_APIFY_TOKEN`: Authentication token for the Apify platform to run scrapers.
- `GEMINI_API_KEY`: Google AI Studio API Key.
- `MAIL_USERNAME` / `MAIL_PASSWORD`: SMTP credentials for outbound emails.
- `FRONTEND_URL`: Used for CORS and generating correct email links.
- `GRAFANA_ADMIN_PASSWORD`: Grafana dashboard password.

**Frontend (`.env.local`)**
- `NEXT_PUBLIC_AUTH_API_URL`: Base Path to auth backend.
- `NEXT_PUBLIC_JOBS_API_URL`: Base Path to jobs backend.
- `NEXT_PUBLIC_SAVED_JOBS_API_URL`: Base Path to saved jobs backend.

---

# 14. Deployment

- **Containerization**: `Dockerfile` is present in both backend and frontend directories.
- **Orchestration**: `docker-compose.yml` ties the whole stack together.
- **Required Services**:
  - Backend Spring Boot (Port 8080)
  - Frontend Next.js (Port 3000)
  - Database PostgreSQL (Port 5432)
  - Nginx Reverse Proxy (Ports 80/443)
  - Prometheus Monitoring (Port 9090)
  - Grafana Dashboards (Port 3001)
- **Production Deployment**: Designed to run on a Linux VPS. Nginx handles SSL and routes `/api` to the backend, and everything else to Next.js frontend.
- **Volumes**:
  - `prometheus_data`: Persistent metrics.
  - `grafana_data`: Persistent dashboards.

---

# 15. Current Limitations

- **Not Implemented Features**: Employer portals (posting jobs manually), Payment gateways for premium features, Social logins (Google/GitHub).
- **Technical Debt**:
  - Dependency on a single job source (LinkedIn via Apify).
  - WebClient scraping polling instead of Webhooks blocks threads.
- **Bugs**:
  - Apify hard limit exhaustion will completely halt platform data ingestion without graceful fallback to alternative scrapers.
- **Unfinished Modules**: Employer flows.

---

# 16. Future Roadmap

1. **[Critical] Apify Webhook Strategy**: Instead of polling Apify for 2 minutes and blocking threads, use Apify Webhooks to notify the backend when a dataset is ready.
2. **[High] Multi-Source Scraping**: Integrate Indeed or Glassdoor scrapers to diversify the job pool.
3. **[High] Employer Portal**: Allow recruiters to bypass scrapers and post jobs directly.
4. **[Medium] Real-time Notifications**: Implement WebSockets or Server-Sent Events (SSE) for in-app job match notifications.
5. **[Medium] OAuth2 Logins**: Add Google / LinkedIn login for faster onboarding.
6. **[Low] Premium Subscriptions (Stripe)**: Gate advanced AI features (like automated cover letter generation) behind a paywall.

---

# 17. Final Summary

**What this project is**: JobFinder is a highly automated, AI-driven recruitment SaaS platform designed to drastically simplify the job hunt for candidates.

**How it works**: It leverages Google Gemini AI to instantly generate rich candidate profiles from uploaded PDF resumes. It utilizes Apify to autonomously aggregate targeted jobs from LinkedIn based on the existing user base's demand, and emails personalized job matches to candidates daily.

**Technology used**: Built on a robust Java Spring Boot backend (PostgreSQL) and a modern Next.js/React frontend (Tailwind CSS, Framer Motion), orchestrated via Docker.

**Current completion level**: The core MVP is fully operational. It successfully handles secure user registration, complex AI-driven data extraction, scheduled autonomous scraping, and automated smart-matching email dispatch.

**Who should use it**: Job seekers looking for a "set and forget" platform that brings highly tailored job opportunities directly to their inbox without manual searching.

**Biggest strengths**: The heavy automation (autonomous scraping + daily matching scheduler) and seamless onboarding via AI CV parsing.

**Biggest weaknesses**: The platform is heavily reliant on Apify's LinkedIn scraper; if Apify changes their API, scraping breaks, or the account runs out of credits, new data ingestion stops entirely. There is no B2B portal yet for direct job postings.
