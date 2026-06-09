# Job Finder API - Full Documentation for Postman

**Base URL**: `http://localhost:8080`

---

## 🔐 1. Authentication (`/api/auth`)

### 1.1. Register New User

-   **Method**: `POST`
-   **URL**: `/api/auth/register`
-   **Description**: Creates a new user account (job seeker or employer). The account will be inactive until the email is verified via OTP.
-   **Authorization**: None

#### Request Body:
```json
{
  "username": "testuser123",
  "email": "test.user123@example.com",
  "password": "Password@123",
  "userType": "jobSeeker" 
}{
  "token": null,
  "email": "test.user123@example.com",
  "role": "JOB_SEEKER",
  "message": "Please verify your email"
}{
  "errorCode": "EMAIL_ALREADY_EXISTS",
  "message": "This email is already registered.",
  "timestamp": "2026-05-08T12:00:00Z"
}{
  "identifier": "test.user123@example.com",
  "password": "Password@123"
}