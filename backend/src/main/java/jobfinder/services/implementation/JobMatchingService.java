package jobfinder.services.implementation;

import jobfinder.model.dto.JobMatchDto;
import jobfinder.model.entity.JobEntity;
import jobfinder.model.entity.UserProfile;
import jobfinder.repository.JobRepository;
import jobfinder.repository.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * ─── Job Matching Engine ─────────────────────────────────────────────────────
 *
 * Computes a 0–100 match score between a user profile and recent jobs.
 * The scoring formula is:
 *
 *   • +50 pts  — job title contains the user's current job title keyword
 *   • +30 pts  — job description/title mentions any of the user's skills
 *               (capped at 30 pts even if many skills match)
 *   • +10 pts  — job employment type matches user preference
 *   • +10 pts  — job was scraped in the last 48 h (freshness bonus)
 *
 * The engine intentionally avoids calling AI for scoring to keep the
 * scheduled task fast and cheap (no API calls per user per job).
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class JobMatchingService {

    private final JobRepository jobRepository;
    private final UserSkillRepository userSkillRepository;

    private static final int RECENT_JOB_LIMIT = 200;
    private static final long FRESH_HOURS = 48;

    public List<JobMatchDto> findTopMatchesForUser(UserProfile profile, int topN) {
        List<JobEntity> recentJobs = jobRepository.findRecentActiveJobs(
                LocalDateTime.now().minusDays(7),
                PageRequest.of(0, RECENT_JOB_LIMIT)
        );
        return findTopMatchesForUser(profile, recentJobs, topN);
    }

    public List<JobMatchDto> findTopMatchesForUser(UserProfile profile,
                                                   List<JobEntity> recentJobs,
                                                   int topN) {

        List<String> skillNames = userSkillRepository.findSkillNamesByUserId(profile.getUser().getId());

        // 2. جهّز الـ Patterns مرة واحدة بره اللوب
        List<Pattern> titlePatterns = buildTitlePatterns(profile.getCurrentJobTitle());
        List<Pattern> skillPatterns = buildSkillPatterns(skillNames);

        List<JobMatchDto> scored = new ArrayList<>();
        for (JobEntity job : recentJobs) {
            String jobText = buildSearchText(job);
            int score = computeScore(job, jobText, titlePatterns, skillPatterns);
            if (score > 0) {
                scored.add(toDto(job, score));
            }
        }

        scored.sort((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()));
        return scored.stream().limit(topN).toList();
    }

    private List<Pattern> buildTitlePatterns(String currentJobTitle) {
        if (currentJobTitle == null || currentJobTitle.isBlank()) return List.of();

        return Arrays.stream(currentJobTitle.toLowerCase(Locale.ROOT).split("\\s+"))
                .filter(word -> word.length() > 2)
                .map(word -> Pattern.compile("\\b" + Pattern.quote(word) + "\\b",
                        Pattern.CASE_INSENSITIVE | Pattern.DOTALL))
                .toList();
    }

    private List<Pattern> buildSkillPatterns(List<String> skillNames) {
        return skillNames.stream()
                .map(skill -> Pattern.compile("\\b" + Pattern.quote(skill) + "\\b",
                        Pattern.CASE_INSENSITIVE | Pattern.DOTALL))
                .toList();
    }

    private int computeScore(JobEntity job,
                             String jobText,
                             List<Pattern> titlePatterns,
                             List<Pattern> skillPatterns) {
        int score = 0;

        // ① Title match (+50)
        for (Pattern p : titlePatterns) {
            if (p.matcher(jobText).find()) {
                score += 50;
                break;
            }
        }

        // ② Skill match (max +30)
        int skillPoints = 0;
        for (Pattern p : skillPatterns) {
            if (skillPoints >= 30) break;
            if (p.matcher(jobText).find()) {
                skillPoints += 5;
            }
        }
        score += skillPoints;

        // ③ Freshness bonus (+10)
        if (job.getScrapedAt() != null &&
                job.getScrapedAt().isAfter(LocalDateTime.now().minusHours(FRESH_HOURS))) {
            score += 10;
        }

        return Math.min(score, 100);
    }

    private String buildSearchText(JobEntity job) {
        StringBuilder sb = new StringBuilder();
        if (job.getTitle() != null)
            sb.append(job.getTitle().toLowerCase(Locale.ROOT)).append(" ");
        if (job.getDescription() != null)
            sb.append(job.getDescription().toLowerCase(Locale.ROOT));
        return sb.toString();
    }

    private JobMatchDto toDto(JobEntity job, int score) {
        return JobMatchDto.builder()
                .id(job.getId())
                .title(job.getTitle())
                .location(job.getLocation())
                .employmentType(job.getEmploymentType())
                .salaryRange(job.getSalaryRange())
                .jobUrl(job.getJobUrl())
                .companyName(job.getCompany() != null ? job.getCompany().getName() : null)
                .companyLogo(job.getCompany() != null ? job.getCompany().getLogoUrl() : null)
                .aiSummary(job.getAiSummary())
                .matchScore(score)
                .build();
    }


}