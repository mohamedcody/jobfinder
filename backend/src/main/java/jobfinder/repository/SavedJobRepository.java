package jobfinder.repository;

import jobfinder.model.dto.SavedJobResponse;
import jobfinder.model.entity.JobEntity;
import jobfinder.model.entity.SavedJob;
import jobfinder.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {

    // ✅ EXISTS بدل COUNT — أسرع بكتير لأن الـ DB بتوقف أول ما تلاقي record
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END " +
            "FROM SavedJob s WHERE s.user.id = :userId AND s.job.id = :jobId AND s.isDeleted = false")
    boolean isJobSaved(@Param("userId") Long userId, @Param("jobId") Long jobId);

    Optional<SavedJob> findByUserAndJobAndIsDeletedFalse(User user, JobEntity job);

    // ✅ بنستخدمها عشان لو فيه row قديم اتعمله soft delete (unsave) نرجّعه (restore)
    // بدل ما ننشئ row جديد كل مرة الـ user يحفظ ويلغي نفس الوظيفة
    Optional<SavedJob> findByUser_IdAndJob_Id(Long userId, Long jobId);

    // ✅ JPQL Projection — بنجيب الـ fields المطلوبة بس من JOIN واحد
    // ⚠️ LEFT JOIN على company لأن فيه jobs ممكن تكون من غير company (company_id = null)
    // لو سيبناها INNER JOIN زي ما كانت، الـ saved job ده كان هيختفي تمامًا من القايمة عند اليوزر
    @Query("""
            SELECT new SavedJobResponse(
                s.id,
                j.id,
                j.title,
                c.name,
                c.logoUrl,
                j.location,
                j.jobUrl,
                j.employmentType,
                s.savedAt,
                s.notes
            )
            FROM SavedJob s
            JOIN s.job j
            LEFT JOIN j.company c
            WHERE s.user.id = :userId AND s.isDeleted = false
            ORDER BY s.savedAt DESC
            """)
    List<SavedJobResponse> findAllSavedJobsByUserId(@Param("userId") Long userId);

    // ✅ Soft delete بـ UPDATE مش DELETE — أسرع وبيحافظ على الـ data
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE SavedJob s SET s.isDeleted = true WHERE s.user.id = :userId AND s.job.id = :jobId AND s.isDeleted = false")
    int softDeleteByUserIdAndJobId(@Param("userId") Long userId, @Param("jobId") Long jobId);

    @Query("SELECT COUNT(s) FROM SavedJob s WHERE s.user.id = :userId AND s.isDeleted = false")
    long countSavedJobsByUserId(@Param("userId") Long userId);

    @Query("""
            SELECT s.job.id
            FROM SavedJob s
            WHERE s.user.id = :userId
              AND s.isDeleted = false
              AND s.job.id IN :jobIds
            """)
    List<Long> findSavedJobIdsByUserIdAndJobIds(
            @Param("userId") Long userId,
            @Param("jobIds") List<Long> jobIds
    );
}