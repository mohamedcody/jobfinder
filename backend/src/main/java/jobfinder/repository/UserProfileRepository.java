package jobfinder.repository;

import jobfinder.model.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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

    /**
     * Check whether a profile exists for a given user.
     * @param userId the user ID
     * @return true if a profile exists
     */
    boolean existsByUserId(Long userId);

    /**
     * Delete a profile by user ID.
     * @param userId the user ID
     */
    void deleteByUserId(Long userId);

    /**
     * Search with eager loading for the User entity.
     * @param userId the user ID
     * @return the profile data along with user data
     */
    @Query("SELECT up FROM UserProfile up " +
            "JOIN FETCH up.user u " +
            "WHERE up.user.id = :userId")
    Optional<UserProfile> findByUserIdWithUser(@Param("userId") Long userId);
}
