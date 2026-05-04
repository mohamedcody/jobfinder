package jobfinder.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jobfinder.model.dto.UpdateUserProfileRequest;
import jobfinder.model.dto.UserProfileResponse;
import jobfinder.services.interfaces.UserProfileInterface;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for User Profile Management
 * Handles GET and PUT requests for the profile.
 * All endpoints are protected by JWT authentication and authorization.
 */
@RestController
@RequestMapping("/api/users/profile")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Profile", description = "Manage the user's personal profile data")
public class UserController {

    private final UserProfileInterface userProfileService;

    /**
     * GET /api/users/profile
     * Get the profile data for the current user.
     * @return a UserProfileResponse containing all profile data
     */
    @Operation(
            summary = "Get my profile",
            description = "Fetch all of your personal profile data, including current job title, experience, and more."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Profile fetched successfully",
                    content = @Content(schema = @Schema(implementation = UserProfileResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - you must sign in first"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Profile not found"
            )
    })
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> getMyProfile() {
        log.info("User requested their profile data");
        UserProfileResponse profile = userProfileService.getMyProfile();
        return ResponseEntity.ok(profile);
    }

    /**
     * PUT /api/users/profile
     * Update the profile data for the current user.
     * Supports partial updates.
     * - You can send only one field and leave the rest unchanged.
     * @param request the update data (all fields are optional)
     * @return a UserProfileResponse containing the updated data
     */
    @Operation(
            summary = "Update my profile",
            description = "Update your profile data, such as job title and years of experience. You can update one field or many."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Profile updated successfully",
                    content = @Content(schema = @Schema(implementation = UserProfileResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid data, such as negative years of experience"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - you must sign in first"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Profile not found"
            )
    })
    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            @Valid @RequestBody UpdateUserProfileRequest request) {
        log.info("User requested to update their profile");
        UserProfileResponse updatedProfile = userProfileService.updateMyProfile(request);
        return ResponseEntity.ok(updatedProfile);
    }

    /**
     * GET /api/users/profile/{userId}
     * Get the profile data for a specific user.
     * (For admins or authorized users.)
     * @param userId the user ID whose profile data should be fetched
     * @return UserProfileResponse
     */
    @Operation(
            summary = "Get a specific user's profile",
            description = "Fetch another user's profile data. Admin privileges are required."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Profile fetched successfully",
                    content = @Content(schema = @Schema(implementation = UserProfileResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "You do not have sufficient permissions"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "User or profile not found"
            )
    })
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable Long userId) {
        log.info("Fetching profile for user: {}", userId);
        UserProfileResponse profile = userProfileService.getUserProfile(userId);
        return ResponseEntity.ok(profile);
    }
}

