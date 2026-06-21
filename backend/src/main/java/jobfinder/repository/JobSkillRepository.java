package jobfinder.repository;

import jobfinder.model.entity.JobSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface JobSkillRepository extends JpaRepository<JobSkill, Long> {

    List<JobSkill> findByJobId(Long jobId);

}
