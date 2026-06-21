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

    // How many recent jobs we pull for each user. Keeps memory bounded.
    private static final int RECENT_JOB_LIMIT = 200;
    // Jobs scraped within this many hours are considered "fresh"
    private static final long FRESH_HOURS = 48;

    /**
     * الميثود دي عشان الـ Controller والـ Test API
     * (بتجيب الوظايف من الداتابيز بنفسها)
     */
    public List<JobMatchDto> findTopMatchesForUser(UserProfile profile, int topN) {
        // Pull the N most-recently-scraped active jobs from DB (one query)
        List<JobEntity> recentJobs = jobRepository.findRecentActiveJobs(
                LocalDateTime.now().minusDays(7),
                PageRequest.of(0, RECENT_JOB_LIMIT)
        );

        // Pass the fetched jobs to the main logic
        return findTopMatchesForUser(profile, recentJobs, topN);
    }

    /**
     * الميثود دي عشان الـ Scheduler
     * (بتاخد الوظايف جاهزة عشان متعملش ضغط على الداتابيز جوة اللوب)
     */
    public List<JobMatchDto> findTopMatchesForUser(UserProfile profile, List<JobEntity> recentJobs, int topN) {
        // 1. Load user skills (names, lowercase for comparison)
        List<String> skillNames = userSkillRepository
                .findByUserId(profile.getUser().getId())
                .stream()
                .map(us -> us.getSkill().getName().toLowerCase(Locale.ROOT))
                .toList();

        // 2. Score each job
        List<JobMatchDto> scored = new ArrayList<>();
        for (JobEntity job : recentJobs) {
            int score = computeScore(job, profile, skillNames);
            if (score > 0) {
                scored.add(toDto(job, score));
            }
        }

        // 3. Sort DESC and take topN
        scored.sort((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()));
        return scored.stream().limit(topN).toList();
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private int computeScore(JobEntity job, UserProfile profile, List<String> skillNames) {
        int score = 0;
        String jobText = buildSearchText(job);  // lowercased concat of title+description

        // ① Title keyword match (+50)
        if (profile.getCurrentJobTitle() != null) {
            String userTitle = profile.getCurrentJobTitle().toLowerCase(Locale.ROOT);
            // Split on spaces so "senior java developer" matches "java developer" jobs
            for (String word : userTitle.split("\\s+")) {
                if (word.length() > 2) {
                    // استخدام Regex عشان كلمة java متعملش ماتش مع javascript
                    String wordRegex = ".*\\b" + Pattern.quote(word) + "\\b.*";
                    if (jobText.matches(wordRegex)) {
                        score += 50;
                        break;
                    }
                }
            }
        }

        // ② Skill keyword match (max +30, +5 per matching skill)
        int skillPoints = 0;
        for (String skill : skillNames) {
            if (skillPoints >= 30) break;
            // استخدام Regex لنفس السبب
            String skillRegex = ".*\\b" + Pattern.quote(skill) + "\\b.*";
            if (jobText.matches(skillRegex)) {
                skillPoints += 5;
            }
        }
        score += skillPoints;

        // ③ Freshness bonus (+10)
        if (job.getScrapedAt() != null &&
                job.getScrapedAt().isAfter(LocalDateTime.now().minusHours(FRESH_HOURS))) {
            score += 10;
        }

        // Cap at 100
        return Math.min(score, 100);
    }

    private String buildSearchText(JobEntity job) {
        StringBuilder sb = new StringBuilder();
        if (job.getTitle() != null) sb.append(job.getTitle().toLowerCase(Locale.ROOT)).append(" ");
        if (job.getDescription() != null) sb.append(job.getDescription().toLowerCase(Locale.ROOT));
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