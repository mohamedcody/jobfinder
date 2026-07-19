/**
 * @deprecated This file is kept only for backward compatibility during migration.
 * All profile service logic has been consolidated into `profile-service.ts`.
 * Import directly from `@/lib/profile/profile-service` instead.
 *
 * This file will be removed in a future cleanup.
 */

// Re-export from the canonical service so any accidental imports still work.
export { profileService, profileApiClient } from "./profile-service";
export type { UserProfileResponse, UpdateProfileRequest } from "./types";
