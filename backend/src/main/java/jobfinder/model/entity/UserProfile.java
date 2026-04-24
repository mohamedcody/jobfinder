package jobfinder.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "current_job_title")
    private String currentJobTitle;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "education_level")
    private String educationLevel;

    // --- Added for Scalability & Precision ---
    @Column(name = "country")
    private String country;

    @Column(name = "city")
    private String city;

    @Column(name = "resume_url", columnDefinition = "TEXT")
    private String resumeUrl; // Link to uploaded CV
    
    @Column(name = "expected_salary")
    private Double expectedSalary;

    @Column(name = "currency", length = 3)
    private String currency; // e.g., "USD", "EGP"

    @Column(name = "is_open_to_work")
    @Builder.Default
    private Boolean isOpenToWork = true;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    @PrePersist
    public void updateTime() {
        this.updatedAt = LocalDateTime.now();
    }
}
