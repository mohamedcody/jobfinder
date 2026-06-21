package jobfinder.repository;
import jobfinder.model.entity.JobEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;





@Repository

public interface JobRepository extends JpaRepository<JobEntity, Long>  , JpaSpecificationExecutor<JobEntity>{


    boolean existsByJobUrl(String jobUrl );


    @Query("select j.jobUrl from JobEntity j where j.jobUrl in :jobUrls")
    List<String> findExistingLinks(@Param("jobUrls") List<String> links);


    // ✅ جديد: بيجيب الـ Job مع الـ Company سوا في query واحد بـ JOIN FETCH
    // قبل كده job.getCompany() كان بيعمل query تاني لوحده (company كانت LAZY)
    // ده بيقلل round-trip للداتابيز من 2 لـ 1 في كل عملية saveJob
    @Query("SELECT j FROM JobEntity j LEFT JOIN FETCH j.company WHERE j.id = :id")
    Optional<JobEntity> findByIdWithCompany(@Param("id") Long id);


    @Query(value = "SELECT * FROM jobs j WHERE " +
            "to_tsvector('english', j.title || ' ' || j.description) @@ to_tsquery('english', :searchTerm)",
            nativeQuery = true)
    List<JobEntity> searchFullText(@Param("searchTerm") String searchTerm);


    @Query(value =
            "SELECT j.*, " +
                    "ts_rank( " +
                    "    to_tsvector('english', COALESCE(j.title,'') || ' ' || COALESCE(j.description,'')), " +
                    "    websearch_to_tsquery('english', :title) " +
                    ") AS rank " +
                    "FROM jobs j " +
                    "WHERE " +
                    "to_tsvector('english', COALESCE(j.title,'') || ' ' || COALESCE(j.description,'')) " +
                    "@@ websearch_to_tsquery('english', :title) " +
                    "AND (:location IS NULL OR j.location ILIKE %:location%) " +
                    "AND (:lastId IS NULL OR j.id < :lastId) " +
                    "ORDER BY rank DESC, j.id DESC " +
                    "LIMIT :size",
            nativeQuery = true)
    List<JobEntity> searchJobsFullText(
            @Param("title")    String title,
            @Param("location") String location,
            @Param("lastId")   Long lastId,
            @Param("size")     int size
    );


    @Query("SELECT j FROM JobEntity j LEFT JOIN FETCH j.company WHERE j.isActive = true AND j.scrapedAt >= :dateTime ORDER BY j.scrapedAt DESC")
    List<JobEntity> findRecentActiveJobs(@Param("dateTime") LocalDateTime dateTime, Pageable pageable);
}