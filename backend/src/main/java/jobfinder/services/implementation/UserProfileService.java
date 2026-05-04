package jobfinder.services.implementation;

import jobfinder.exception.BaseException;
import jobfinder.exception.ErrorCode;
import jobfinder.model.dto.UpdateUserProfileRequest;
import jobfinder.model.dto.UserProfileResponse;
import jobfinder.model.entity.User;
import jobfinder.model.entity.UserProfile;
import jobfinder.repository.UserProfileRepository;
import jobfinder.repository.UserRepository;
import jobfinder.services.interfaces.UserProfileInterface;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileService implements UserProfileInterface {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    @Override
    public UserProfileResponse getMyProfile() {
        User currentUser = getCurrentUser();
        UserProfile profile = userProfileRepository.findByUserId(currentUser.getId())
                .orElseGet(() -> createDefaultProfile(currentUser));
        return mapToResponse(profile);
    }

    @Override
    @Transactional
    public UserProfileResponse updateMyProfile(UpdateUserProfileRequest request) {
        User currentUser = getCurrentUser();
        UserProfile profile = userProfileRepository.findByUserId(currentUser.getId())
                .orElseGet(() -> createDefaultProfile(currentUser));

        if (request.getCurrentJobTitle() != null) profile.setCurrentJobTitle(request.getCurrentJobTitle());
        if (request.getYearsOfExperience() != null) profile.setYearsOfExperience(request.getYearsOfExperience());
        if (request.getEducationLevel() != null) profile.setEducationLevel(request.getEducationLevel());
        if (request.getCountry() != null) profile.setCountry(request.getCountry());
        if (request.getCity() != null) profile.setCity(request.getCity());
        if (request.getResumeUrl() != null) profile.setResumeUrl(request.getResumeUrl());
        if (request.getExpectedSalary() != null) profile.setExpectedSalary(request.getExpectedSalary());
        if (request.getCurrency() != null) profile.setCurrency(request.getCurrency());
        if (request.getIsOpenToWork() != null) profile.setIsOpenToWork(request.getIsOpenToWork());
        if (request.getBio() != null) profile.setBio(request.getBio());

        UserProfile savedProfile = userProfileRepository.save(profile);
        return mapToResponse(savedProfile);
    }

    @Override
    public UserProfileResponse getUserProfile(Long userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.INVALID_INPUT, "Profile not found for user ID: " + userId));
        return mapToResponse(profile);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private UserProfile createDefaultProfile(User user) {
        UserProfile profile = UserProfile.builder()
                .user(user)
                .isOpenToWork(true)
                .build();
        return userProfileRepository.save(profile);
    }

    private UserProfileResponse mapToResponse(UserProfile p) {
        return UserProfileResponse.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .username(p.getUser().getUsername())
                .email(p.getUser().getEmail())
                .currentJobTitle(p.getCurrentJobTitle())
                .yearsOfExperience(p.getYearsOfExperience())
                .educationLevel(p.getEducationLevel())
                .country(p.getCountry())
                .city(p.getCity())
                .resumeUrl(p.getResumeUrl())
                .expectedSalary(p.getExpectedSalary())
                .currency(p.getCurrency())
                .isOpenToWork(p.getIsOpenToWork())
                .bio(p.getBio())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
