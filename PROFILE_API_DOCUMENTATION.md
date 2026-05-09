# Backend Profile API Documentation

## Overview
This document describes the Profile Management API endpoints that handle user profile data in the Job Finder platform.

---

## 📋 API Endpoints

### 1. Get Current User Profile
**Endpoint:** `GET /api/users/profile`  
**Authentication:** ✅ Required (JWT Token)  
**Description:** Retrieves the currently logged-in user's profile information.

#### Response Body (200 OK):
```json
{
  "id": 1,
  "user_id": 5,
  "username": "admin",
  "email": "mohamedelamby55@gmail.com",
  "current_job_title": "Professional",
  "years_of_experience": 0,
  "education_level": null,
  "country": "Cairo",
  "city": "e.g",
  "resume_url": null,
  "expected_salary": null,
  "currency": null,
  "is_open_to_work": true,
  "bio": "i am aback end developer i am a sinro mohameed saala abdallah ahmed salah ahmed engendedy",
  "updated_at": "2026-05-08T09:29:07"
}
```

#### Error Response (401 Unauthorized):
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing JWT token"
}
```

---

### 2. Update Current User Profile
**Endpoint:** `PUT /api/users/profile`  
**Authentication:** ✅ Required (JWT Token)  
**Description:** Updates the currently logged-in user's profile information. All fields are optional for partial updates.

#### Request Body:
```json
{
  "current_job_title": "Senior Software Engineer",
  "years_of_experience": 5,
  "education_level": "Bachelors",
  "country": "Egypt",
  "city": "Cairo",
  "resume_url": "https://example.com/resume.pdf",
  "expected_salary": 50000,
  "currency": "EGP",
  "is_open_to_work": true,
  "bio": "Passionate backend developer with expertise in Spring Boot and microservices",
  "skills": ["Java", "Spring Boot", "PostgreSQL", "Docker"]
}
```

#### Response Body (200 OK):
```json
{
  "id": 1,
  "user_id": 5,
  "username": "admin",
  "email": "mohamedelamby55@gmail.com",
  "current_job_title": "Senior Software Engineer",
  "years_of_experience": 5,
  "education_level": "Bachelors",
  "country": "Egypt",
  "city": "Cairo",
  "resume_url": "https://example.com/resume.pdf",
  "expected_salary": 50000,
  "currency": "EGP",
  "is_open_to_work": true,
  "bio": "Passionate backend developer with expertise in Spring Boot and microservices",
  "updated_at": "2026-05-09T10:30:00"
}
```

#### Error Response (400 Bad Request):
```json
{
  "error": "Validation Error",
  "message": "Expected salary must be a positive number"
}
```

#### Error Response (401 Unauthorized):
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing JWT token"
}
```

---

## 📊 Field Specifications

| Field | Type | Required | Constraints | Example |
|-------|------|----------|-------------|---------|
| `current_job_title` | string | ❌ No | max 150 chars | "Senior Backend Engineer" |
| `years_of_experience` | number | ❌ No | 0-70 | 5 |
| `education_level` | string | ❌ No | One of: High School, Bachelors, Masters, PhD | "Bachelors" |
| `country` | string | ❌ No | max 100 chars | "Egypt" |
| `city` | string | ❌ No | max 100 chars | "Cairo" |
| `resume_url` | string | ❌ No | valid URL | "https://example.com/resume.pdf" |
| `expected_salary` | number | ❌ No | >= 0 | 50000 |
| `currency` | string | ❌ No | 3-letter code (USD, EGP, EUR, GBP, SAR, AED) | "EGP" |
| `is_open_to_work` | boolean | ❌ No | true/false | true |
| `bio` | string | ❌ No | max 1000 chars | "Passionate developer..." |
| `skills` | array | ❌ No | Array of skill names | ["Java", "Spring Boot"] |

---

## 🔐 Authentication

All Profile endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

## ✅ Validation Rules

1. **Years of Experience:** Must be between 0 and 70
2. **Expected Salary:** Must be a positive number or null
3. **Currency:** Must be a valid 3-letter ISO 4217 code
4. **Bio:** Maximum 1000 characters
5. **Current Job Title:** Maximum 150 characters
6. **Education Level:** Must be one of the predefined options
7. **Country/City:** Maximum 100 characters each

---

## 🔗 Frontend Integration

### Using the `useUserProfile` Hook

```typescript
import { useUserProfile } from "@/hooks/use-user-profile";
import type { UpdateProfileRequest } from "@/lib/profile/profile-service";

export function MyComponent() {
  const { profile, isLoading, isSaving, updateProfile } = useUserProfile();

  const handleSave = async (data: UpdateProfileRequest) => {
    try {
      await updateProfile(data);
      // Profile successfully updated
    } catch (error) {
      // Handle error
    }
  };

  return (
    // Your component JSX
  );
}
```

### Sending Updates

```typescript
const updates: UpdateProfileRequest = {
  current_job_title: "Senior Developer",
  years_of_experience: 5,
  expected_salary: 50000,
  currency: "EGP",
  skills: ["React", "Node.js", "TypeScript"],
  is_open_to_work: true,
  bio: "Experienced full-stack developer"
};

await updateProfile(updates);
```

---

## 📝 Notes

1. **Partial Updates:** You only need to send the fields you want to update. Omitted fields remain unchanged.
2. **Skills:** Skills are sent as an array of strings and should be comma-separated in the UI.
3. **Currency:** Must match the ISO 4217 standard (e.g., "USD", "EGP", "EUR").
4. **Timestamps:** The `updated_at` field is automatically set by the server.

---

## 🧪 Testing Checklist

- [ ] Get current user profile without errors
- [ ] Update single field (partial update) - works correctly
- [ ] Update multiple fields at once - works correctly
- [ ] Update with valid salary and currency - saved correctly
- [ ] Add skills - displayed and saved correctly
- [ ] Remove individual skills - works correctly
- [ ] Update bio - long text displays correctly
- [ ] Send request with missing JWT - returns 401
- [ ] Send request with invalid years_of_experience - returns 400
- [ ] Update expects_salary to null - works correctly
- [ ] Update is_open_to_work to false - reflected in profile
- [ ] Verify all fields in response match request

