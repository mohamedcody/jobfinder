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

    // 1. الميثود دي بتجيب آخر كود فعال وبتقفل السطر في الداتابيز (Lock)
    // عشان لو فيه كذا Request في نفس اللحظة ميبوظوش عداد المحاولات
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM OtpCode o WHERE o.user = :user AND o.used = false ORDER BY o.createdAt DESC")
    Optional<OtpCode> findLatestValidOtpWithLock(@Param("user") User user);

    // 2. ميثود المسح الشامل لكل أكواد اليوزر
    // الـ @Modifying مهمة جداً لأنها بتعرف سبرينج إن دي عملية Update/Delete مش Select
    @Modifying
    @Query("DELETE FROM OtpCode o WHERE o.user = :user")
    void deleteAllByUser(@Param("user") User user);

    // 3. ميثود إبطال الأكواد القديمة (لو حبيت تستخدمها في الـ Register)
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



    // عشان يتوافق مع سطر 203 في الـ AuthService اللي محتاج لستة يعمل عليها forEach
    List<OtpCode> findByUserAndUsedFalse(User user);

    /**
     * Returns the latest unused OTP for verification to avoid selecting stale records.
     */
    Optional<OtpCode> findTopByUserAndUsedFalseOrderByCreatedAtDesc(User user);


    // 2. التعديل الثاني: غير النوع هنا لـ Optional
    // عشان يتوافق مع سطر 189 في الـ AuthService اللي بينادي .orElseThrow()
    Optional<OtpCode> findByUserAndCodeAndUsedFalse(User user, String code);

}