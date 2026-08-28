# JobFinder Engineering Plan

This plan organizes technical debt, bugs, and missing features identified during the architectural and discovery audits.

## Phase A — Critical (Security, Data Integrity, Production Blockers)

| ID | Problem | Exact Location | Proposed Solution | Risk | Status |
|----|---------|----------------|-------------------|------|--------|
| A-1 | **Reactive Paradigm Mismatch** | `CvUploadController.java:uploadCv` | The controller calls `.block()` on a WebFlux `Mono` from `CvAiExtractionService`. This blocks standard Servlet worker threads, risking thread pool exhaustion under load. Refactor the controller to return a `CompletableFuture` or `Mono`. | High (System crash under load) | Planned |
| A-2 | **OTP Loss via Async Email** | `AuthService.java` & `EmailService.java` | OTP is saved to DB, then email is sent via `@Async`. If the email fails silently, the user is stuck because the DB has an OTP they never received. Wrap the process safely or handle the async failure. | High (User lockout) | Planned |
| A-3 | **In-Memory Rate Limiter** | `RateLimitFilter.java` | The rate limiter uses a `ConcurrentHashMap`. In a multi-instance production environment, this is ineffective and causes memory leaks over time. Migrate to a Redis-based distributed rate limiter. | Medium | Planned |

## Phase B — High (Serious Bugs, Architectural Issues, Performance)

| ID | Problem | Exact Location | Proposed Solution | Risk | Status |
|----|---------|----------------|-------------------|------|--------|
| B-1 | **N+1 Query in Job Search** | `JobService.java:searchJobsByFilter` | `jobRepository.findAll(spec)` does not eager-load `CompanyEntity`. Mapping to DTO triggers a query per job for the company name. Use `@EntityGraph` or a JOIN FETCH in the `JobSpecification`. | High (Database overload) | Planned |
| B-2 | **Duplicated AI Logic** | `JobMatchingService.java` & `SemanticMatchingService.java` | The logic for aggregating profile text, generating embeddings, and querying `pgvector` is identically implemented in both services. Consolidate into a single source of truth to respect DRY. | Low | Planned |
| B-3 | **Duplicate CSP Headers** | `infra/nginx/nginx.conf` | `Content-Security-Policy` is defined twice (Lines 18 and 20). Remove the redundant header and merge the rules correctly. | Low | Planned |
| B-4 | **Missing Pagination on Saved Jobs** | `SavedJobService.java:getMySavedJobs` | Returns all saved jobs for a user at once. If a user saves hundreds of jobs, this impacts memory and network overhead. Implement pagination. | Low | Planned |

## Phase C — Medium (Maintainability, Testing, Reliability)

| ID | Problem | Exact Location | Proposed Solution | Risk | Status |
|----|---------|----------------|-------------------|------|--------|
| C-1 | **Critically Low Test Coverage** | `src/test/java/jobfinder/**` | Missing tests for `AuthService`, `SavedJobService`, `UserProfileService`, and `Security filters`. Write comprehensive unit and integration tests for these core flows. | Medium | Planned |
| C-2 | **"God Service" Anti-pattern** | `AuthService.java` | Handles registration, login, OTP, lockouts, and password resets in a ~300-line file. Split into `UserRegistrationService`, `AuthenticationService`, and `PasswordResetService`. | Low | Planned |
| C-3 | **Missing Entity Equivalency** | All JPA Entities (e.g., `JobEntity.java`) | Missing `equals()` and `hashCode()` relying on business keys or DB IDs. Implement them to prevent issues with Hibernate proxies and `Set` collections. | Low | Planned |

## Phase D — Low (Cleanup, Consistency, Minor Improvements)

| ID | Problem | Exact Location | Proposed Solution | Risk | Status |
|----|---------|----------------|-------------------|------|--------|
| D-1 | **Docker Compose Healthchecks** | `docker-compose.yml` | Backend has a commented-out health check. Frontend and Nginx have none. Add proper healthchecks and `depends_on` conditions. | Low | Planned |
| D-2 | **Empty Test Properties** | `application-test.properties` | File is completely empty. Define an embedded H2 or Testcontainers PostgreSQL configuration for reliable integration testing. | Low | Planned |
| D-3 | **Grafana Default Credentials** | `docker-compose.yml` | Grafana starts with default admin/admin. Configure secure defaults via environment variables. | Low | Planned |
