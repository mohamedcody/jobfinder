package jobfinder.services.interfaces;

import jobfinder.model.dto.UpdateUserProfileRequest;
import jobfinder.model.dto.UserProfileResponseDto;

/**
 * Interface for User Profile Service
 * Defines the available operations for handling profile data.
 */
public interface UserProfileInterface {

    /**
     * Get the current user's profile data.
     * @return the profile data
     */
    UserProfileResponseDto getMyProfile();

    /**
     * Update the current user's profile data.
     * @param request the update payload
     * @return the updated profile
     */
    UserProfileResponseDto updateMyProfile(UpdateUserProfileRequest request);

    /**
     * Get a specific user's profile data (admins only).
     * @param userId the user identifier
     * @return the profile data
     */
    UserProfileResponseDto getUserProfile(Long userId);


    
}

