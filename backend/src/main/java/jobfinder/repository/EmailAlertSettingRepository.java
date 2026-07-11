package jobfinder.repository;

import jobfinder.model.entity.EmailAlertSetting;
import jobfinder.model.entity.JobEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmailAlertSettingRepository extends JpaRepository<EmailAlertSetting, Long> {

    Optional<EmailAlertSetting> findByUserId(Long userId);

    /**
     * Returns all opted-in users with their full profile eagerly loaded.
     * The scheduler calls this once per run to avoid N+1 in the loop.
     */

    @Query("""
        SELECT eas FROM EmailAlertSetting eas
        JOIN FETCH eas.user u
        JOIN FETCH u.profile p
        WHERE eas.dailyDigestEnabled = true
          AND p.currentJobTitle IS NOT NULL
          AND TRIM(p.currentJobTitle) <> ''
    """)
    List<EmailAlertSetting> findAllOptedInWithProfile(Pageable pageable);

}
