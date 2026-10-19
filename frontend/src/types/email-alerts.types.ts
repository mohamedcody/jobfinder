/**
 * Email Alert Types — Frontend
 * Mirrors backend DTOs: EmailAlertResponseDto & UpdateEmailAlertRequest
 */

/**
 * Response from GET/PUT /api/users/profile/alerts
 */
export interface EmailAlertResponse {
  dailyDigestEnabled: boolean;
  minMatchScore: number;
}

/**
 * Request body for PUT /api/users/profile/alerts
 * Both fields are required (@NotNull on backend)
 * minMatchScore: 0–100 (validated server-side with @Min/@Max)
 */
export interface UpdateEmailAlertRequest {
  dailyDigestEnabled: boolean;
  minMatchScore: number;
}

/**
 * Backend error response shape from GlobalExceptionHandler
 */
export interface EmailAlertErrorResponse {
  errorCode: string;
  message: string;
  timestamp: string;
  path: string;
}
