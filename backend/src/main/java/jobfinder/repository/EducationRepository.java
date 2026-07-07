package jobfinder.repository;

import jobfinder.model.entity.Education;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EducationRepository extends JpaRepository<Education, Long> {

    List<Education> findByProfileId(Long profileId);

    @Modifying
    @Query("DELETE FROM Education e WHERE e.profile.id = :profileId")
    void deleteAllByProfileId(@Param("profileId") Long profileId);
}
