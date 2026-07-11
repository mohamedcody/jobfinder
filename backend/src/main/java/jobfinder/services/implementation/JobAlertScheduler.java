package jobfinder.services.implementation;

import jobfinder.model.dto.JobMatchDto;
import jobfinder.model.entity.EmailAlertSetting;
import jobfinder.model.entity.JobEntity;
import jobfinder.model.entity.User;
import jobfinder.model.entity.UserProfile;
import jobfinder.repository.EmailAlertSettingRepository;
import jobfinder.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ─── Daily Job-Match Scheduler ───────────────────────────────────────────────
 *
 * Fires every day at 09:00 (server local time).
 * For each opted-in user it:
 *   1. Retrieves the user's profile (already JOIN FETCH'd → no N+1)
 *   2. Runs the matching engine to find the best-fit jobs
 *   3. Filters jobs below the user's configured minimum score
 *   4. Sends an async email if there are any qualifying matches
 *
 * Failures for individual users are caught and logged so one bad
 * account never aborts the batch for the remaining users.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Slf4j // Create a logger for tracking application events and errors.
@Service // Register this class as a Spring Service Bean.
@RequiredArgsConstructor // Generate constructor for all final dependencies.
public class JobAlertScheduler {

    // Repository responsible for loading users' email alert settings.
    private final EmailAlertSettingRepository emailAlertSettingRepository;
    // Service responsible for calculating job matches.
    private final JobMatchingService          jobMatchingService;
    // Service مسؤولة عن إرسال رسائل البريد الإلكتروني.
    private final EmailNotificationService    emailNotificationService;
    // Repository responsible for retrieving jobs from the database.
    private final JobRepository jobRepository;

    // Maximum number of jobs to include in one email.
    private static final int MAX_JOBS_PER_EMAIL = 8;

    @Scheduled(cron = "0 */5 * * * ?")   // 09:00 every day
    public void sendDailyJobAlerts() {
        log.info("📬 [JobAlertScheduler] Starting daily job-alert batch process...");

        // Load recent active jobs from the last 7 days.
        // Fetch jobs exactly ONCE for the entire batch to avoid redundant DB calls
        List<JobEntity> recentJobs = jobRepository.findRecentActiveJobs(
                LocalDateTime.now().minusDays(100),
                PageRequest.of(0, 200)
        );

        if (recentJobs.isEmpty()) {
            log.warn("⚠️ [JobAlertScheduler] No recent active jobs found in the last 7 days. Aborting batch.");
            // Exit the method immediately.
            return;
        }
        log.info("💼 [JobAlertScheduler] Fetched {} recent active jobs for matching.", recentJobs.size());

        // Current page number for pagination.
        int pageNumber = 0;

// Number of users processed in one database query.
        final int CHUNK_SIZE = 500;

// Statistics used for the final execution report.

        int totalSent = 0;       // Successfully sent emails.


        int totalSkipped = 0;    // Users with no matching jobs.


        int totalErrors = 0;     // Failed users.


        int totalProcessed = 0;  // Total processed users.


        // Keep processing user batches until no more users are available.
        while (true) {

            // Load one batch of users who enabled email alerts.
            List<EmailAlertSetting> optedInUsers = emailAlertSettingRepository.findAllOptedInWithProfile(
                    // Request the current page with the configured batch size.
                    PageRequest.of(pageNumber, CHUNK_SIZE)
            );

            if (optedInUsers.isEmpty()) {
                break; // Exit loop when no more users are returned
            }

            log.info("👥 [JobAlertScheduler] Processing chunk {} (Users: {})", pageNumber + 1, optedInUsers.size());

            for (EmailAlertSetting setting : optedInUsers) {
                totalProcessed++;
                try {
                    // Extract the current user from the email alert configuration.
                    User user = setting.getUser();
                    UserProfile profile = user.getProfile();

                    // Passes the pre-fetched recentJobs list directly to the service
                    List<JobMatchDto> topMatches = jobMatchingService
                            .findTopMatchesForUser(profile, recentJobs, MAX_JOBS_PER_EMAIL)
                            .stream()
                            .filter(m -> m.getMatchScore() >= setting.getMinMatchScore())
                            .toList();

                    if (topMatches.isEmpty()) {
                        totalSkipped++;
                        continue;
                    }

                    String firstName = extractFirstName(user.getUsername());
                    emailNotificationService.sendDailyDigest(user.getEmail(), firstName, topMatches);
                    totalSent++;

                } catch (Exception e) {
                    totalErrors++;
                    // Robust logging identifying exactly which user failed
                    log.error("❌ [JobAlertScheduler] Error processing alert for User ID [{}]: {}",
                            setting.getUser().getId(), e.getMessage(), e);
                }
            }
            
            // Move to the next chunk
            pageNumber++;

        }

        log.info("✅ [JobAlertScheduler] Daily alert batch completed! Total Processed: {}, Sent: {}, Skipped: {}, Errors: {}",
                totalProcessed, totalSent, totalSkipped, totalErrors);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String extractFirstName(String username) {
        if (username == null || username.isBlank()) return "there";
        String[] parts = username.trim().split("\\s+");
        return parts[0];
    }
}
//الساعة 9 صباحاً
//      ↓
//جيب كل الوظائف الحديثة (7 أيام)
//      ↓
//جيب 500 مستخدم
//      ↓
//لكل مستخدم:
//        ↓
//جيب الوظائف المناسبة له
//  ↓
//فلتر (أفضل 8 فقط، وأعلى من نسبته المطلوبة)
//  ↓
//هل في وظائف؟
//نعم → ابعت إيميل ✅
//لا → تخطي ⏭️
//        ↓
//انتقل للمستخدم التالي
//      ↓
//اطبع التقرير النهائي