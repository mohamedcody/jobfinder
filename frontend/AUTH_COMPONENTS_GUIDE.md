# Authentication Components Guide

## Overview
This guide provides an overview of the production-ready authentication components integrated with the Spring Boot backend.

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Auth pages group
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # Login page
│   │   │   ├── register/
│   │   │   │   └── page.tsx          # Register page
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx          # Forgot password page
│   │   │   ├── reset-password/
│   │   │   │   ├── page.tsx          # Reset password page wrapper
│   │   │   │   └── reset-password-form.tsx
│   │   │   ├── verify-email/
│   │   │   │   ├── page.tsx          # Verify email page wrapper
│   │   │   │   └── verify-email-form.tsx
│   │   │   └── layout.tsx            # Auth layout
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── auth/
│   │   │   ├── text-field.tsx        # Text input component (with forwardRef)
│   │   │   ├── password-field.tsx    # Password input with show/hide (with forwardRef)
│   │   │   ├── otp-field.tsx         # OTP input component (with forwardRef)
│   │   │   ├── submit-button.tsx     # Submit button with loading state
│   │   │   ├── auth-shell.tsx        # Auth page container
│   │   │   └── auth-showcase.tsx     # Auth sidebar showcase
│   │   └── providers/
│   │       └── app-toaster.tsx       # Toast notification provider
│   ├── features/
│   │   └── auth/
│   │       └── schemas.ts            # Zod validation schemas
│   └── lib/
│       └── auth/
│           ├── api-client.ts         # Axios instance
│           ├── api-error.ts          # Error handling utility
│           ├── auth-service.ts       # Auth API service
│           ├── token-storage.ts      # JWT token management
│           ├── types.ts              # TypeScript interfaces
│           └── use-auth-session.ts   # Auth session hook
```

## Core Components

### 1. API Layer

#### `api-client.ts`
- Axios instance configured with base URL and interceptors
- Automatically adds JWT token to requests
- Handles token expiration

#### `auth-service.ts`
- Service methods for all auth endpoints:
  - `register(payload)` - User registration
  - `login(payload)` - User login
  - `forgotPassword(payload)` - Request password reset OTP
  - `resetPassword(payload)` - Reset password with OTP
  - `verifyEmail(payload)` - Verify email with OTP

#### `api-error.ts`
- `getApiErrorMessage(error)` - Extracts user-friendly error messages from API responses

### 2. Form Components

All form inputs use `forwardRef` for react-hook-form integration:

#### `TextField` (`text-field.tsx`)
- Standard text input with label and error display
- Supports all HTML input props
- Forward ref for react-hook-form

#### `PasswordField` (`password-field.tsx`)
- Password input with show/hide toggle
- Forward ref for react-hook-form
- Client component with state management

#### `OtpField` (`otp-field.tsx`)
- Numeric input for OTP codes
- 6-digit max length
- Letter spacing for better UX
- Forward ref for react-hook-form

#### `SubmitButton` (`submit-button.tsx`)
- Loading state with spinner
- Disabled state management
- Customizable children

### 3. Page Components

#### Login Page (`app/(auth)/login/page.tsx`)
- Fields: identifier (email/username), password
- Uses `loginSchema` for validation
- On success: saves token and redirects to home

#### Register Page (`app/(auth)/register/page.tsx`)
- Fields: username, email, password, confirmPassword
- Uses `registerSchema` for validation
- Password strength requirements
- On success: redirects to verify-email

#### Forgot Password Page (`app/(auth)/forgot-password/page.tsx`)
- Field: email
- Uses `forgotPasswordSchema` for validation
- On success: redirects to reset-password

#### Reset Password Form (`app/(auth)/reset-password/reset-password-form.tsx`)
- Fields: email, otpCode, newPassword, confirmPassword
- Uses `resetPasswordSchema` for validation
- Password match validation
- On success: redirects to login

#### Verify Email Form (`app/(auth)/verify-email/verify-email-form.tsx`)
- Fields: email, otp
- Uses `verifyEmailSchema` for validation
- On success: redirects to login

### 4. Validation Schemas

All schemas are in `features/auth/schemas.ts` using Zod:

#### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@#$%^&+=)

#### Schemas
- `registerSchema` - Registration with password confirmation
- `loginSchema` - Login with identifier and password
- `forgotPasswordSchema` - Email validation
- `resetPasswordSchema` - Reset with OTP and password confirmation
- `verifyEmailSchema` - Email and OTP validation

### 5. Token Management

#### `token-storage.ts`
Functions for JWT token management:
- `saveToken(token)` - Save to localStorage
- `getToken()` - Retrieve from localStorage
- `clearToken()` - Remove from localStorage
- `isTokenExpired(token)` - Check expiration
- `hasValidToken()` - Check validity

#### `use-auth-session.ts`
React hook for authentication state:
- `token` - Current JWT token
- `isAuthenticated` - Boolean auth state
- `login(token)` - Save token and update state
- `logout()` - Clear token and update state

## API Integration

### Backend Configuration

Set the backend URL in `.env.local`:

```env
NEXT_PUBLIC_AUTH_API_URL=http://localhost:8080/api/auth
```

### API Endpoints

All endpoints expect JSON and return JSON:

- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with OTP
- `POST /verify-email` - Verify email with OTP

## Usage Examples

### Using in a Page

```tsx
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return <LoginForm />;
}
```

### Custom Error Handling

```tsx
import { authService } from "@/lib/auth/auth-service";
import { getApiErrorMessage } from "@/lib/auth/api-error";

try {
  await authService.login({ identifier, password });
} catch (error) {
  const message = getApiErrorMessage(error);
  toast.error(message);
}
```

### Authentication Check

```tsx
"use client";

import { useAuthSession } from "@/lib/auth/use-auth-session";

export default function ProtectedPage() {
  const { isAuthenticated, logout } = useAuthSession();

  if (!isAuthenticated) {
    return <p>Please login</p>;
  }

  return (
    <div>
      <h1>Protected Content</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Features

### ✅ Implemented
- User registration with validation
- Login with email or username
- Forgot password flow
- Reset password with OTP
- Email verification with OTP
- JWT token management
- Form validation with Zod
- Error handling with user-friendly messages
- Loading states
- Success/error notifications (Sonner)
- Responsive design
- Dark mode support via CSS variables
- Session persistence
- Token expiration handling

### 🎨 Styling
- Tailwind CSS v4
- Custom CSS variables for theming
- Responsive design (mobile-first)
- Animated backgrounds
- Glass morphism effects
- Accessible color contrast

### 🔒 Security
- Client-side validation
- JWT token in localStorage
- Automatic token expiration check
- Token attached to API requests
- HTTPS support (production)

## Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

## Troubleshooting

### Token Not Persisting
- Check that localStorage is available
- Verify token is being saved correctly
- Check browser console for errors

### API Errors
- Verify backend is running
- Check `NEXT_PUBLIC_AUTH_API_URL` in `.env.local`
- Inspect network tab for request/response
- Use `getApiErrorMessage` for proper error extraction

### Form Validation Errors
- Check Zod schemas in`
- Verify form field `features/auth/schemas.ts names match schema
- Check browser console for validation errors

## Best Practices

1. Always use `getApiErrorMessage` for error handling
2. Keep schemas in sync with backend validation
3. Use the provided hooks for authentication state
4. Never expose tokens in URLs or logs
5. Clear tokens on logout
6. Check token expiration before API calls
7. Use environment variables for configuration

## Support

For issues or questions:
- Check the code documentation
- Review the backend API documentation
- Contact: Mohamed Saad Abdalla & Ahmed Zaatary
