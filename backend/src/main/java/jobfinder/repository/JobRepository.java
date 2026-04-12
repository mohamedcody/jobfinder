package jobfinder.repository;
import jobfinder.model.entity.JobEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;





@Repository
public interface JobRepository extends JpaRepository<JobEntity, Long> {


    boolean existsByJobUrl(String jobUrl );


    List<JobEntity> findFirst11ByIdGreaterThanOrderByIdAsc(Long id);


    List<JobEntity> findByTitleContainingIgnoreCaseAndIdGreaterThanOrderByIdAsc(String title, Long id, Pageable pageable);
}
