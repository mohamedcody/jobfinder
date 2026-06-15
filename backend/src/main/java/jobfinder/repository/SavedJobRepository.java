package jobfinder.repository;

import jobfinder.model.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {

    // 1. دي ميثود بتسأل الداتا بيس: هل اليوزر ده حفظ الوظيفة دي قبل كده؟ بترجع صح أو غلط
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END " +
           "FROM SavedJob s WHERE s.user.id = :userId AND s.job.id = :jobId AND s.isDeleted = false")
    boolean isJobSaved(@Param("userId") Long userId, @Param("jobId") Long jobId);

    // 2. دي بتجيب الوظيفة المحفوظة نفسها لو موجودة ومش ممسوحة
    Optional<SavedJob> findByUserAndJobAndIsDeletedFalse(User user, JobEntity job);

    // 3. دي بتجيب كل الوظايف اللي اليوزر حفظها (عشان نعرضهم في صفحته)
    @Query("SELECT s FROM SavedJob s WHERE s.user.id = :userId AND s.isDeleted = false ORDER BY s.savedAt DESC")
    List<SavedJob> findAllByUserId(@Param("userId") Long userId);
    
    // 4. دي بتعد هو اليوزر حفظ كام وظيفة لحد دلوقتي
    @Query("SELECT COUNT(s) FROM SavedJob s WHERE s.user.id = :userId AND s.isDeleted = false")
    long countSavedJobsByUserId(@Param("userId") Long userId);
}