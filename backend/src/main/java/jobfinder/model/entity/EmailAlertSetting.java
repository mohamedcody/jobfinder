package jobfinder.model.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Tracks whether a user has opted in or out of the daily job-match email.
 * A separate table keeps the concern separate from UserPreference
 * (which stores job-search filter preferences, not notification opt-ins).
 */
@Entity
@Table(
    name = "email_alert_settings",
    indexes = @Index(name = "idx_email_alert_user", columnList = "user_id")
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailAlertSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    /**
     * When true the daily digest is sent to this user.
     * Default is true (opted-in) to maximise early-stage engagement.
     */
    @Builder.Default
    @Column(name = "daily_digest_enabled", nullable = false)
    private Boolean dailyDigestEnabled = true;

    /**
     * Minimum match score (0-100) the user requires before a job appears
     * in their digest. Default 60 keeps the list relevant without being too strict.
     */
    @Builder.Default
    @jakarta.validation.constraints.Min(value = 0, message = "Match score must be at least 0")
    @jakarta.validation.constraints.Max(value = 100, message = "Match score cannot exceed 100")
    @Column(name = "min_match_score", nullable = false)
    private Integer minMatchScore = 60;
}

