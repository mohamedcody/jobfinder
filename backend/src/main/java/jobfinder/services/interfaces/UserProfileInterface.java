package jobfinder.services.interfaces;

import jobfinder.model.dto.UpdateUserProfileRequest;
import jobfinder.model.dto.UserProfileResponse;

/**
 * Interface for User Profile Service
 * Defines the available operations for working with profile data.
 */
public interface UserProfileInterface {

    /**
     * Get the profile data for the current user.
     * @return the profile data
     */
    UserProfileResponse getMyProfile();

    /**
     * Update the current user's profile data.
     * @param request the update data
     * @return the updated profile
     */
    UserProfileResponse updateMyProfile(UpdateUserProfileRequest request);

    /**
     * Get the profile data for a specific user (admins only).
     * @param userId the user ID
     * @return the profile data
     */
    UserProfileResponse getUserProfile(Long userId);
}

