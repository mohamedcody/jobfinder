# 🏗️ Architecture & Data Flow - Profile System

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           user-profile.tsx (Component)              │  │
│  │  - Form rendering                                   │  │
│  │  - User interaction                                 │  │
│  │  - Error display                                    │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                        │
│                   ▼                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        use-user-profile.ts (Custom Hook)            │  │
│  │  - State management (profile, loading, error)       │  │
│  │  - Calls service functions                          │  │
│  │  - Handles lifecycle                                │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                        │
│                   ▼                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     service.ts (API Client)                         │  │
│  │  - fetchUserProfile()                               │  │
│  │  - updateUserProfile()                              │  │
│  │  - Error handling                                   │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                        │
└─────────────────┼─────────────────────────────────────────┘
                  │
         HTTP/REST API (JWT Auth)
                  │
┌─────────────────▼─────────────────────────────────────────┐
│                    BACKEND (Spring Boot)                   │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │    UserProfileController                           │ │
│  │  - GET /api/users/profile                          │ │
│  │  - PUT /api/users/profile                          │ │
│  │  - Handles HTTP requests/responses                 │ │
│  └──────────────┬──────────────────────────────────────┘ │
│                 │                                        │
│                 ▼                                        │
│  ┌─────────────────────────────────────────────────────┐ │
│  │    UserProfileService (Interface & Implementation) │ │
│  │  - getMyProfile()                                  │ │
│  │  - updateMyProfile()                               │ │
│  │  - getUserProfile()                                │ │
│  │  - updateProfileFields()                           │ │
│  │  - mapToResponse()                                 │ │
│  │  - getCurrentUserId()                              │ │
│  └──────────────┬──────────────────────────────────────┘ │
│                 │                                        │
│                 ▼                                        │
│  ┌─────────────────────────────────────────────────────┐ │
│  │    UserProfileRepository (JPA)                     │ │
│  │  - findByUserId()                                  │ │
│  │  - findByUserIdWithUser()                          │ │
│  │  - existsByUserId()                                │ │
│  │  - deleteByUserId()                                │ │
│  └──────────────┬──────────────────────────────────────┘ │
│                 │                                        │
│                 ▼                                        │
│  ┌─────────────────────────────────────────────────────┐ │
│  │         DATABASE (PostgreSQL/MySQL)                │ │
│  │  - user_profiles table                             │ │
│  │  - user table (relationship)                       │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## Data Flow Sequence

### Flow 1️⃣: جلب البروفايل (GET)

```
User Opens Profile Page
        │
        ▼
Component Mounts
        │
        ▼
useUserProfile Hook Executes
        │
        ▼
Check if User is Authenticated (useAuthSession)
        │
        ├─ NO ──► Show Error: "Not authenticated"
        │
        └─ YES ──┐
                 │
                 ▼
        refetch() Called
                 │
                 ▼
        fetchUserProfile() (Service)
                 │
                 ▼
        axios.get('/users/profile') with JWT Token
                 │
        HTTP Request sent to Backend
                 │
┌───────────────┴──────────────────┐
│                                  │
▼                                  ▼
Backend Route Handler         JWT Filter
UserProfileController              │
.getMyProfile()           Validate Token & Extract User
    │                              │
    ▼                              ▼
Service.getMyProfile()      SecurityContextHolder.getContext()
    │
    ▼
Get Current User ID
    │
    ▼
Repository.findByUserIdWithUser(userId)
    │
    ▼
Database Query
    │
    ▼
UserProfile Entity Retrieved
    │
    ▼
mapToResponse() ──► UserProfileResponse DTO
    │
    ▼
Return 200 OK + JSON Response
    │
HTTP Response Back to Frontend
    │
    ▼
Axios Interceptor (Success)
    │
    ▼
Hook Updates State
    │
    ▼
Component Re-renders with Profile Data
    │
    ▼
User Sees Profile Display
```

### Flow 2️⃣: تحديث البروفايل (PUT)

```
User Clicks Edit Button
        │
        ▼
Edit Mode Activated
        │
        ▼
User Modifies Form Fields
        │
        ▼
User Clicks "Save Changes"
        │
        ▼
Form Validation (Frontend)
        │
        ├─ INVALID ──► Show Error Toast
        │
        └─ VALID ──┐
                   │
                   ▼
        updateProfile(formData) Called
                   │
                   ▼
        updateUserProfile(request) (Service)
                   │
                   ▼
        axios.put('/users/profile', data) with JWT Token
                   │
        HTTP PUT Request sent to Backend
                   │
┌──────────────────┴──────────────────────┐
│                                         │
▼                                         ▼
Backend Route Handler              JWT Filter
UserProfileController                  │
.updateMyProfile(request)    Validate Token & Extract User
    │                                   │
    ▼                                   ▼
Service.updateMyProfile()      SecurityContextHolder
    │
    ▼
Get Current User ID
    │
    ▼
Repository.findByUserId(userId)
    │
    ├─ NOT FOUND ──► Throw ResourceNotFoundException
    │
    └─ FOUND ──┐
               │
               ▼
    validateFields (Backend Validation)
               │
               ├─ INVALID ──► Throw ValidationException (400)
               │
               └─ VALID ──┐
                          │
                          ▼
        updateProfileFields(profile, request)
        (Selective field updates)
                          │
                          ▼
        profile.setUpdatedAt(now())
                          │
                          ▼
        Repository.save(profile)
                          │
                          ▼
        Database INSERT/UPDATE
                          │
                          ▼
        mapToResponse() ──► Updated UserProfileResponse DTO
                          │
                          ▼
        Return 200 OK + Updated JSON
                          │
HTTP Response Back to Frontend
                          │
                          ▼
Axios Interceptor (Success)
                          │
                          ▼
Hook Updates State with New Profile
                          │
                          ▼
Component Re-renders
                          │
                          ▼
Edit Mode Deactivated
                          │
                          ▼
Show Success Toast: "Profile updated!"
                          │
                          ▼
User Sees Updated Profile
```

---

## Error Handling Flow

```
Request Fails
        │
        ▼
Catch Error in Service
        │
        ├─ Axios Error ──┐
        │                │
        │                ▼
        │        Check Error Status
        │        │
        │        ├─ 401 ──► isAuthError(true)
        │        │          Message: "Session expired"
        │        │
        │        ├─ 400 ──► isValidationError(true)
        │        │          Message: "Invalid data"
        │        │
        │        └─ 500 ──► Server Error
        │                   Message: "Server error"
        │
        └─ Other Error ──► Unexpected Error
                           Message: "Failed to update"
        │
        ▼
Update Hook State
    {
        loading: false,
        error: "Error message",
        data: null
    }
        │
        ▼
Component Displays Error
        │
        ▼
toast.error("Error message")
        │
        ▼
User Sees Error Notification
```

---

## Database Schema

### user_profiles Table

```sql
CREATE TABLE user_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    
    current_job_title VARCHAR(150),
    years_of_experience INT,
    education_level VARCHAR(100),
    
    country VARCHAR(100),
    city VARCHAR(100),
    
    resume_url TEXT,
    expected_salary DECIMAL(10, 2),
    currency VARCHAR(3),
    
    is_open_to_work BOOLEAN DEFAULT true,
    bio TEXT,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE,
    INDEX idx_profile_user_id (user_id),
    INDEX idx_profile_open_to_work (is_open_to_work)
);
```

### Relationships

```
app_users (1)
    │
    ├─ OneToOne (bidirectional)
    │
user_profiles (1)
    │
    └─ ManyToOne (if extended)
```

---

## State Management

### Frontend Hook State

```typescript
interface ProfileState {
    data: UserProfileResponse | null;      // Actual profile data
    loading: boolean;                      // Is data being fetched?
    error: string | null;                  // Error message if any
}

// State Transitions:
// 1. Initial:  { data: null, loading: true, error: null }
// 2. Loading:  { data: null, loading: true, error: null }
// 3. Success:  { data: {...}, loading: false, error: null }
// 4. Error:    { data: null, loading: false, error: "msg" }
// 5. Updating: { data: {...}, loading: true, error: null }
```

---

## Security Flow

```
Request Arrives
        │
        ▼
JwtAuthenticationFilter
        │
        ├─ Extract JWT from Header
        │
        ├─ Validate Token Signature
        │
        ├─ Check Token Expiration
        │
        ├─ Invalid ──► 401 Unauthorized
        │
        └─ Valid ──┐
                   │
                   ▼
        Extract Claims (email, roles)
                   │
                   ▼
        Create Authentication Object
                   │
                   ▼
        Set to SecurityContextHolder
                   │
                   ▼
        Continue to Controller
                   │
                   ▼
        @PreAuthorize("isAuthenticated()")
                   │
                   ├─ Not Authenticated ──► 401
                   │
                   └─ Authenticated ──┐
                                      │
                                      ▼
                             Controller Method Executes
                                      │
                                      ▼
                             getCurrentUserId() (from SecurityContext)
                                      │
                                      ▼
                             Process Request
```

---

## API Contracts

### GET /api/users/profile

```
REQUEST:
    Headers: Authorization: Bearer <JWT>
    
RESPONSE (200):
    {
      "id": 1,
      "user_id": 1,
      "username": "ahmed",
      "email": "ahmed@example.com",
      "current_job_title": "Senior Dev",
      "years_of_experience": 5,
      "education_level": "Bachelor",
      "country": "Egypt",
      "city": "Cairo",
      "resume_url": "https://...",
      "expected_salary": 50000,
      "currency": "USD",
      "is_open_to_work": true,
      "bio": "...",
      "updated_at": "2026-04-30T10:00:00"
    }

ERROR RESPONSES:
    401: Not authenticated
    404: Profile not found
    500: Server error
```

### PUT /api/users/profile

```
REQUEST:
    Headers: Authorization: Bearer <JWT>
    Body: {
        "current_job_title": "Tech Lead",  // Optional
        "years_of_experience": 6           // Optional
        // Any field can be updated
    }
    
RESPONSE (200):
    // Same as GET but with updated values
    
ERROR RESPONSES:
    400: Validation error
    401: Not authenticated
    404: Profile not found
    500: Server error
```

---

## Performance Considerations

### Database Optimization
```sql
-- Indexed queries
SELECT * FROM user_profiles WHERE user_id = ? -- Fast (unique key)
SELECT * FROM user_profiles WHERE is_open_to_work = true -- Indexed
SELECT * FROM user_profiles WHERE country = ? -- Consider indexing
```

### Frontend Optimization
```tsx
// Use memoization
const memoizedProfile = useMemo(() => profile, [profile]);

// Prevent unnecessary re-renders
const handleUpdate = useCallback(async (data) => {
    // ...
}, []);

// Debounce rapid updates
const debouncedUpdate = useCallback(
    debounce((data) => updateProfile(data), 500),
    []
);
```

---

## ✅ Checklist للتطوير

- [ ] فهمت الـ Architecture
- [ ] فهمت الـ Data Flow
- [ ] تعرف على Database Schema
- [ ] فهمت State Management
- [ ] فهمت Security Flow
- [ ] تعرف على Error Handling
- [ ] تعرف على Performance Tips

---

Happy Architecture Learning! 🏗️

