package jobfinder.repository;

import jobfinder.model.entity.UserInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserInteractionRepository extends JpaRepository<UserInteraction, Long> {
    List<UserInteraction> findByUserId(Long userId);
    List<UserInteraction> findByJobId(Long jobId);
    Optional<UserInteraction> findByUserIdAndJobIdAndInteractionType(Long userId, Long jobId, UserInteraction.InteractionType type);
}
