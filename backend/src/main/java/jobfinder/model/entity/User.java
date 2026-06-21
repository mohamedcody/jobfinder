package jobfinder.model.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "app_users", indexes = {
        @Index(name = "idx_users_email", columnList = "email"),
        @Index(name = "idx_users_username", columnList = "username")
})
@Getter@Setter@AllArgsConstructor@NoArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, length = 150)
    private String username;

    @Column(name = "email", nullable = false, length = 150, unique = true)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "role", nullable = false, length = 20)
    private String role;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = false;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @Column(name = "failed_attempts", nullable = false)
    private Integer failedAttempts = 0;

    @Column(name = "lockout_time")
    private LocalDateTime lockoutTime;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OtpCode> otpCodes;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private UserProfile profile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private UserPreference preference;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private EmailAlertSetting alertSetting;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserSkill> skills;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserInteraction> interactions;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.failedAttempts == null) this.failedAttempts = 0;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
