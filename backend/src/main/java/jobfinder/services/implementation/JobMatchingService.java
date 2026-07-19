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
    private final jobfinder.repository.UserProfileRepository userProfileRepository;
    private final SemanticMatchingService semanticMatchingService;

    private static final int RECENT_JOB_LIMIT = 200;
    private static final long FRESH_HOURS = 48;

    /**
     * AI Semantic Job Matching Engine
     * Fetches zero N+1 entity graphs, aggregates safely, caches vector to save costs,
     * and queries pgvector.
     */
    @org.springframework.transaction.annotation.Transactional
    public List<JobEntity> findSemanticMatchesForUser(Long profileId, int limit) {
        // 1. Fetch Profile and related entities efficiently (Zero N+1)
        UserProfile profile = userProfileRepository.findByIdWithUserAndSkills(profileId)
                .orElseThrow(() -> new jobfinder.exception.BaseException(jobfinder.exception.ErrorCode.USER_NOT_FOUND, "User profile not found."));
        
        // This hydrates the workExperienceList in the same Persistence Context to avoid Cartesian product
        userProfileRepository.findByIdWithWorkExperiences(profileId);

        // 2. Cost-Saving Caching Strategy
        boolean generateNewEmbedding = true;
        if (profile.getEmbedding() != null && profile.getEmbeddingGeneratedAt() != null) {
            if (profile.getEmbeddingGeneratedAt().isAfter(LocalDateTime.now().minusDays(30))) {
                generateNewEmbedding = false;
            }
        }

        if (generateNewEmbedding) {
            // Aggregation: Highly optimized mechanism using StringBuilder
            StringBuilder aggregatedText = new StringBuilder(1024); // Dynamically growing but starting with a reasonable capacity

            if (profile.getBio() != null) {
                aggregatedText.append(profile.getBio()).append(" ");
            }
            if (profile.getCurrentJobTitle() != null) {
                aggregatedText.append(profile.getCurrentJobTitle()).append(" ");
            }

            if (profile.getUser() != null) {
                jobfinder.model.entity.UserPreference pref = profile.getUser().getPreference();
                if (pref != null && pref.getPreferredJobTitles() != null) {
                    for (String title : pref.getPreferredJobTitles()) {
                        if (title != null && !title.isBlank()) {
                            aggregatedText.append(title.trim()).append(" ");
                        }
                    }
                }

                List<jobfinder.model.entity.UserSkill> skills = profile.getUser().getSkills();
                if (skills != null) {
                    for (jobfinder.model.entity.UserSkill us : skills) {
                        if (us != null && us.getSkill() != null && us.getSkill().getName() != null && !us.getSkill().getName().isBlank()) {
                            aggregatedText.append(us.getSkill().getName().trim()).append(" ");
                        }
                    }
                }
            }

            List<jobfinder.model.entity.WorkExperience> experiences = profile.getWorkExperienceList();
            if (experiences != null) {
                for (jobfinder.model.entity.WorkExperience exp : experiences) {
                    if (exp != null) {
                        if (exp.getJobTitle() != null && !exp.getJobTitle().isBlank()) {
                            aggregatedText.append(exp.getJobTitle().trim()).append(" ");
                        }
                        if (exp.getDescription() != null && !exp.getDescription().isBlank()) {
                            aggregatedText.append(exp.getDescription().trim()).append(" ");
                        }
                    }
                }
            }

            String finalAggregatedText = aggregatedText.toString().trim();
            if (finalAggregatedText.isEmpty()) {
                log.warn("Aggregated profile text is empty for profileId: {}", profileId);
                return List.of();
            }

            float[] newEmbedding = semanticMatchingService.generateEmbedding(finalAggregatedText);
            if (newEmbedding == null || newEmbedding.length == 0) {
                log.error("Semantic service failed to generate a valid embedding for profileId: {}", profileId);
                return List.of();
            }

            profile.setEmbedding(newEmbedding);
            profile.setEmbeddingGeneratedAt(LocalDateTime.now());
            userProfileRepository.save(profile); // Transaction boundary handles the commit
        }

        // Convert the float[] vector to string format expected by PostgreSQL: "[0.1,0.2,...]" without spaces
        String vectorString = Arrays.toString(profile.getEmbedding()).replaceAll("\\s+", "");

        return jobRepository.findTopMatchingJobs(vectorString, limit);
    }

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

        String preferredJobType = null;
        if (profile.getUser() != null && profile.getUser().getPreference() != null) {
            preferredJobType = profile.getUser().getPreference().getJobType();
        }

        List<JobMatchDto> scored = new ArrayList<>();
        for (JobEntity job : recentJobs) {
            String jobText = buildSearchText(job);
            int score = computeScore(job, jobText, titlePatterns, skillPatterns, preferredJobType);
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
                             List<Pattern> skillPatterns,
                             String preferredJobType) {
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

        // ④ Employment Type match (+10)
        if (preferredJobType != null && !preferredJobType.isBlank() && job.getEmploymentType() != null) {
            String prefNorm = preferredJobType.replaceAll("[-_\\s]", "").toLowerCase(Locale.ROOT);
            String jobNorm = job.getEmploymentType().replaceAll("[-_\\s]", "").toLowerCase(Locale.ROOT);
            if (prefNorm.equals(jobNorm) || jobNorm.contains(prefNorm) || prefNorm.contains(jobNorm)) {
                score += 10;
            }
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