package jobfinder.servics.implemention;

import jobfinder.model.dto.JobMatchDto;
import jobfinder.model.entity.*;
import jobfinder.repository.JobRepository;
import jobfinder.repository.UserSkillRepository;
import jobfinder.services.implementation.JobMatchingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobMatchingServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private UserSkillRepository userSkillRepository;

    @InjectMocks
    private JobMatchingService jobMatchingService;

    private UserProfile profile;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);

        profile = new UserProfile();
        profile.setUser(user);
        profile.setCurrentJobTitle("Java Developer");
    }

    // ─── Helper methods ───────────────────────────────────────────────────────

    private JobEntity makeJob(String title, String description, boolean fresh) {
        JobEntity job = new JobEntity();
        job.setId(1L);
        job.setTitle(title);
        job.setDescription(description);
        job.setIsActive(true);
        job.setScrapedAt(fresh
                ? LocalDateTime.now().minusHours(10)   // fresh ✅
                : LocalDateTime.now().minusDays(5));   // not fresh ❌
        return job;
    }

    private UserSkill makeUserSkill(String skillName) {
        Skill skill = new Skill();
        skill.setName(skillName);

        UserSkill userSkill = new UserSkill();
        userSkill.setSkill(skill);
        return userSkill;
    }

    // ─── Test Cases ───────────────────────────────────────────────────────────

    @Test
    void shouldReturn50WhenTitleMatches() {
        // Job فيه كلمة "java" في العنوان
        JobEntity job = makeJob("Senior Java Developer", "some description", false);
        lenient().when(userSkillRepository.findByUserId(1L)).thenReturn(List.of());

    }
}