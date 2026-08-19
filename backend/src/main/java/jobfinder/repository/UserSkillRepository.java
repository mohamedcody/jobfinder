package jobfinder.repository;

import jobfinder.model.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"skill"})
    List<UserSkill> findByUserId(Long userId);

    @Modifying
    @Query("""
    DELETE FROM UserSkill us
    WHERE us.user.id = :userId
""")
    void deleteAllByUserId(@Param("userId") Long userId);



    @Query("""
    SELECT LOWER(s.name)
    FROM UserSkill us
    JOIN us.skill s
    WHERE us.user.id = :userId
""")
    List<String> findSkillNamesByUserId(@Param("userId") Long userId);

}
