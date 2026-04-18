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


    List<JobEntity> findByTitleContainingIgnoreCaseAndIdGreaterThanOrderByIdAsc(String title, Long id, Pageable pageable);


    @Query("SELECT j FROM JobEntity j WHERE " +
            "(:title IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
            "(j.id > :lastId) " +
            "ORDER BY j.id ASC")
    List<JobEntity> findJobsSmartFilter(
            @Param("title")   String title  ,
            @Param("location") String  location ,
            @Param("lastId")   Long lastId  ,
            Pageable pageable
    );

}
