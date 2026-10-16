package jobfinder.repository;

import jobfinder.model.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for UserProfile entity
 * Provides search, persistence, and retrieval operations from the database.
 */
@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    /**
     * Find a profile by user ID.
     * @param userId the user ID
     * @return the profile data, if present
     */
    Optional<UserProfile> findByUserId(Long userId);

    @org.springframework.data.jpa.repository.Modifying
    @Query(value = "INSERT INTO user_profiles (user_id, is_open_to_work, updated_at) VALUES (:userId, true, NOW()) ON CONFLICT (user_id) DO NOTHING", nativeQuery = true)
    void createProfileIfNotExists(@Param("userId") Long userId);
    @Query("""
        SELECT DISTINCT LOWER(TRIM(up.currentJobTitle))
        FROM UserProfile up
        WHERE up.currentJobTitle IS NOT NULL
          AND TRIM(up.currentJobTitle) <> ''
        ORDER BY 1
        """)
    List<String> findDistinctCurrentJobTitles();

    @Query("SELECT p FROM UserProfile p " +
           "JOIN FETCH p.user u " +
           "LEFT JOIN FETCH u.preference " +
           "LEFT JOIN FETCH u.skills s " +
           "LEFT JOIN FETCH s.skill " +
           "WHERE p.id = :profileId")
    Optional<UserProfile> findByIdWithUserAndSkills(@Param("profileId") Long profileId);

    @Query("SELECT p FROM UserProfile p " +
           "LEFT JOIN FETCH p.workExperienceList " +
           "WHERE p.id = :profileId")
    Optional<UserProfile> findByIdWithWorkExperiences(@Param("profileId") Long profileId);
}

