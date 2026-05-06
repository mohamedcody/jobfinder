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





}
