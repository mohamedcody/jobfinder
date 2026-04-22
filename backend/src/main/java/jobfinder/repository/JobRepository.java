package jobfinder.repository;
import jobfinder.model.entity.JobEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;





@Repository

public interface JobRepository extends JpaRepository<JobEntity, Long>  , JpaSpecificationExecutor<JobEntity>{


    boolean existsByJobUrl(String jobUrl );


    List<JobEntity> findFirst11ByIdGreaterThanOrderByIdAsc(Long id);


    @Query("SELECT j FROM JobEntity j WHERE " +
            "(:title IS NULL OR :title = '' OR LOWER(j.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:location IS NULL OR :location = '' OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
            "(:employmentType IS NULL OR :employmentType = '' OR LOWER(j.employmentType) = LOWER(:employmentType)) AND " +
            "(:postedAfter IS NULL OR j.scrapedAt >= :postedAfter) AND " +
            "(:lastId IS NULL OR j.id < :lastId) " +
            "ORDER BY j.id DESC")
    List<JobEntity> findJobsAdvancedFilter(
            @Param("title") String title,
            @Param("location") String location,
            @Param("employmentType") String employmentType,
            @Param("postedAfter") java.time.LocalDateTime postedAfter,
            @Param("lastId") Long lastId,
            Pageable pageable
    );

}
