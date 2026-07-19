package jobfinder.repository;

import jobfinder.model.entity.JobEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<JobEntity, Long>, JpaSpecificationExecutor<JobEntity> {

    // ✅ جلب الـ URL الموجودة (بدون company - optimize الذاكرة)
    @Query("SELECT j.jobUrl FROM JobEntity j WHERE j.jobUrl IN :jobUrls")
    List<String> findExistingLinks(@Param("jobUrls") List<String> links);

    // ✅ جلب Job واحد مع الشركة (بدون N+1)
    @EntityGraph(attributePaths = "company")
    @Query("SELECT j FROM JobEntity j WHERE j.id = :id AND j.isActive = true")
    Optional<JobEntity> findByIdWithCompany(@Param("id") Long id);

    // ✅ جلب قائمة الوظائف مع الشركات (للـ pagination - مهم جداً!)
    @EntityGraph(attributePaths = "company")
    @Query("SELECT j FROM JobEntity j WHERE j.isActive = true ORDER BY j.id DESC")
    List<JobEntity> findAllActive(Pageable pageable);

    // ✅ جلب الوظائف الحديثة مع الشركات
    @EntityGraph(attributePaths = "company")
    @Query("SELECT j FROM JobEntity j " +
            "WHERE j.isActive = true AND j.scrapedAt >= :dateTime " +
            "ORDER BY j.scrapedAt DESC")
    List<JobEntity> findRecentActiveJobs(
            @Param("dateTime") LocalDateTime dateTime,
            Pageable pageable
    );

    // ✅ البحث الكامل باستخدام Full-Text Search المحسّن

    @Query(value =
            "SELECT j.*, " +
                    "ts_rank(j.search_vector, websearch_to_tsquery('english', :searchTerm)) AS rank " +
                    "FROM jobs j " +
                    "WHERE j.search_vector @@ websearch_to_tsquery('english', :searchTerm) " +
                    "AND j.is_active = true " +
                    "AND (CAST(:location AS text) IS NULL OR j.location ILIKE CONCAT('%', CAST(:location AS text), '%')) " +
                    "AND (CAST(:lastId AS bigint) IS NULL OR j.id < CAST(:lastId AS bigint)) " +
                    "ORDER BY rank DESC, j.id DESC " +
                    "LIMIT :size",
            nativeQuery = true,
            countQuery = "SELECT COUNT(*) FROM jobs j WHERE j.search_vector @@ websearch_to_tsquery('english', :searchTerm) AND j.is_active = true AND (CAST(:location AS text) IS NULL OR j.location ILIKE CONCAT('%', CAST(:location AS text), '%'))")
    List<JobEntity> searchJobsFullText(
            @Param("searchTerm") String searchTerm,
            @Param("location") String location,
            @Param("lastId") Long lastId,
            @Param("size") int size
    );


    // ✅ جلب الوظائف المتطابقة مع الـ CV بتاع اليوزر باستخدام الذكاء الاصطناعي
    @Query(value = """
            SELECT * FROM jobs 
            WHERE is_active = true 
            AND embedding IS NOT NULL 
            ORDER BY embedding <=> cast(:userVector as vector) 
            LIMIT :limit
            """, nativeQuery = true)
    List<JobEntity> findTopMatchingJobs(@Param("userVector") String userVector, @Param("limit") int limit);

}