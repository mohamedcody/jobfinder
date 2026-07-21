package jobfinder.services.assets;

import jakarta.mail.internet.MimeMessage;
import jobfinder.model.dto.JobMatchDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Sends the daily job-match digest email using an HTML template.
 * Each send is dispatched on a separate thread (@Async) so the
 * scheduler loop is never blocked by SMTP latency.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    /**
     * Sends the daily digest email to a single user.
     *
     * @param toEmail   recipient address
     * @param firstName recipient's first name (used in greeting)
     * @param matches   ordered list of matched jobs
     */
    @Async
    public void sendDailyDigest(String toEmail, String firstName, List<JobMatchDto> matches) {
        if (matches == null || matches.isEmpty()) {
            log.debug("No matches for {}. Skipping email.", toEmail);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("🎯 " + matches.size() + " New Job Matches Just For You!");
            helper.setText(buildHtml(firstName, matches), true);  // true = isHtml

            mailSender.send(message);
            log.info("✅ Daily digest sent to {}", toEmail);

        } catch (Exception e) {
            // Log but never rethrow — one user's email failure should not stop the batch
            log.error("❌ Failed to send digest to {}: {}", toEmail, e.getMessage());
        }
    }

    // ─── HTML Template ────────────────────────────────────────────────────────

    private String buildHtml(String firstName, List<JobMatchDto> matches) {
        StringBuilder sb = new StringBuilder();

        sb.append("""
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8"/>
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
              <title>Your Daily Job Matches</title>
            </head>
            <body style="margin:0;padding:0;background-color:#0f0f1a;font-family:'Inter',Arial,sans-serif;">

            <!-- Outer Wrapper -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f1a;padding:40px 0;">
              <tr><td align="center">

              <!-- Email Card -->
              <table width="620" cellpadding="0" cellspacing="0"
                     style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);
                            border-radius:20px;border:1px solid rgba(139,92,246,0.2);
                            box-shadow:0 20px 60px rgba(0,0,0,0.5);overflow:hidden;">

                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:36px 40px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:14px;color:rgba(255,255,255,0.7);letter-spacing:3px;text-transform:uppercase;">JobFinder AI</p>
                    <h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff;line-height:1.2;">
                      🎯 Your Daily Job Matches
                    </h1>
                    <p style="margin:12px 0 0;font-size:15px;color:rgba(255,255,255,0.8);">
                      Curated exclusively for you by our AI engine
                    </p>
                  </td>
                </tr>

                <!-- Greeting -->
                <tr>
                  <td style="padding:32px 40px 8px;">
                    <p style="margin:0;font-size:17px;color:#e2e8f0;line-height:1.6;">
                      Hi <strong style="color:#a78bfa;">""").append(firstName == null ? "there" : escapeHtml(firstName)).append("""
                      </strong> 👋
                    </p>
                    <p style="margin:12px 0 0;font-size:15px;color:#94a3b8;line-height:1.7;">
                      We found <strong style="color:#a78bfa;">""").append(matches.size()).append("""
                      </strong> new opportunities that match your profile. Don't let them pass you by!
                    </p>
                  </td>
                </tr>

                <!-- Divider -->
                <tr><td style="padding:20px 40px;">
                  <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(139,92,246,0.4),transparent);"></div>
                </td></tr>

                <!-- Job Cards -->
                <tr><td style="padding:0 40px 8px;">
            """);

        for (JobMatchDto job : matches) {
            sb.append(buildJobCard(job));
        }

        sb.append("""
                </td></tr>

                <!-- CTA Button -->
                <tr>
                  <td style="padding:24px 40px 40px;text-align:center;">
                    <a href="https://jobfinder.saad.dev/jobs"
                       style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);
                              color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;
                              padding:14px 36px;border-radius:12px;letter-spacing:0.5px;">
                      🚀 View All Matches
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:rgba(0,0,0,0.3);padding:20px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0;font-size:12px;color:#475569;">
                      You're receiving this because you opted in to daily job alerts.<br/>
                      <a href="https://jobfinder.saad.dev/profile" style="color:#7c3aed;text-decoration:none;">Manage email preferences</a>
                    </p>
                  </td>
                </tr>

              </table>
              </td></tr>
            </table>
            </body>
            </html>
            """);

        return sb.toString();
    }

    private String buildJobCard(JobMatchDto job) {
        String companyDisplay = job.getCompanyName() != null ? escapeHtml(job.getCompanyName()) : "Company";
        String title          = job.getTitle()       != null ? escapeHtml(job.getTitle())       : "Job Opportunity";
        String location       = job.getLocation()    != null ? escapeHtml(job.getLocation())    : "Remote";
        String summary        = job.getAiSummary()   != null
                ? escapeHtml(job.getAiSummary().length() > 200
                    ? job.getAiSummary().substring(0, 200) + "…"
                    : job.getAiSummary())
                : "";
        String scoreColor = job.getMatchScore() >= 80 ? "#10b981" : job.getMatchScore() >= 60 ? "#f59e0b" : "#6366f1";

        return """
            <table width="100%%" cellpadding="0" cellspacing="0"
                   style="background:rgba(255,255,255,0.03);border:1px solid rgba(139,92,246,0.15);
                          border-radius:16px;margin-bottom:16px;overflow:hidden;">
              <tr>
                <td style="padding:20px 24px;">

                  <!-- Top Row: Company + Match Score -->
                  <table width="100%%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <p style="margin:0;font-size:12px;color:#64748b;font-weight:600;
                                  text-transform:uppercase;letter-spacing:1px;">%s</p>
                      </td>
                      <td align="right">
                        <span style="background:%s;color:#fff;font-size:11px;font-weight:700;
                                     padding:3px 10px;border-radius:20px;">%d%% Match</span>
                      </td>
                    </tr>
                  </table>

                  <!-- Job Title -->
                  <h3 style="margin:8px 0 4px;font-size:17px;font-weight:700;color:#e2e8f0;">%s</h3>

                  <!-- Location & Type -->
                  <p style="margin:0 0 12px;font-size:13px;color:#64748b;">
                    📍 %s
                    %s
                  </p>

                  <!-- AI Summary -->
                  %s

                  <!-- CTA -->
                  <a href="%s"
                     style="display:inline-block;margin-top:14px;background:rgba(124,58,237,0.15);
                            border:1px solid rgba(124,58,237,0.4);color:#a78bfa;
                            text-decoration:none;font-size:13px;font-weight:600;
                            padding:8px 20px;border-radius:8px;">
                    View Job →
                  </a>

                </td>
              </tr>
            </table>
            """.formatted(
                companyDisplay,
                scoreColor,
                job.getMatchScore(),
                title,
                location,
                job.getEmploymentType() != null
                    ? "&nbsp;·&nbsp;<span style=\"color:#7c3aed;\">" + escapeHtml(job.getEmploymentType()) + "</span>"
                    : "",
                summary.isEmpty() ? "" :
                    "<p style=\"margin:0;font-size:13px;color:#94a3b8;line-height:1.6;\">" + summary + "</p>",
                job.getJobUrl() != null ? job.getJobUrl() : "#"
        );
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input
            .replace("&",  "&amp;")
            .replace("<",  "&lt;")
            .replace(">",  "&gt;")
            .replace("\"", "&quot;");
    }
}
