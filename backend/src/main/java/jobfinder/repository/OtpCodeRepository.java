package jobfinder.repository;

import jakarta.persistence.LockModeType;
import jobfinder.model.entity.OtpCode;
import jobfinder.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;
import java.util.Optional;


@Repository
public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {

    // 1. This method fetches the latest active OTP and locks the row in the database.
    // This prevents concurrent requests from corrupting the attempt counter.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM OtpCode o WHERE o.user = :user AND o.used = false ORDER BY o.createdAt DESC")
    Optional<OtpCode> findLatestValidOtpWithLock(@Param("user") User user);

    // 2. Method for deleting all OTP codes for a user.
    // @Modifying is important because it tells Spring this is an Update/Delete operation, not a Select.
    @Modifying
    @Query("DELETE FROM OtpCode o WHERE o.user = :user")
    void deleteAllByUser(@Param("user") User user);

    // 3. Method for deactivating old OTP codes (if you want to use it during registration).
    @Modifying
    @Query("UPDATE OtpCode o SET o.used = true WHERE o.user = :user AND o.used = false")
    void deactivateOldOtps(@Param("user") User user);

    /**
     * Returns the most recently generated OTP for a user.
     * Used to enforce a resend cooldown and prevent OTP spam.
     */
    Optional<OtpCode> findTopByUserOrderByCreatedAtDesc(User user);

    /**
     * Removes OTP records older than the provided cutoff.
     * Used by the scheduled cleanup job to keep the table small and tidy.
     */
    @Modifying
    @Query("DELETE FROM OtpCode o WHERE o.createdAt < :cutoff")
    void deleteAllByCreatedAtBefore(@Param("cutoff") LocalDateTime cutoff);



    // This matches line 203 in AuthService, which expects a list to iterate over with forEach.
    List<OtpCode> findByUserAndUsedFalse(User user);

    /**
     * Returns the latest unused OTP for verification to avoid selecting stale records.
     */
    Optional<OtpCode> findTopByUserAndUsedFalseOrderByCreatedAtDesc(User user);


    // 2. Second adjustment: change the return type here to Optional.
    // This matches line 189 in AuthService, which calls .orElseThrow().
    Optional<OtpCode> findByUserAndCodeAndUsedFalse(User user, String code);

}