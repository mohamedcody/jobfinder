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


    @Query("select j.jobUrl from JobEntity j where j.jobUrl in:Links")
     List<String> findExistingLinks(@Param("jobUrls") List<String> Links);


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







}
