package jobfinder.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.List;

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

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "city", columnDefinition = "TEXT")
    private String city;

    @Column(name = "country", columnDefinition = "TEXT")
    private String country;

    @Column(name = "currency", length = 3)
    private String currency; // e.g., "USD", "EGP"

    @Column(name = "current_job_title", columnDefinition = "TEXT")
    private String currentJobTitle;

    @Column(name = "education_level", length = 255)
    private String educationLevel;

    @Column(name = "expected_salary")
    private Double expectedSalary;

    @Column(name = "is_open_to_work")
    private Boolean isOpenToWork;

    @Column(name = "resume_url", columnDefinition = "TEXT")
    private String resumeUrl; // Link to uploaded CV

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    // --- CV Parsing: Raw AI output stored as JSONB for audit/backup ---
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "cv_raw_data", columnDefinition = "jsonb")
    private String cvRawData;

    @Column(name = "cv_parsed_at")
    private LocalDateTime cvParsedAt;

    // --- CV Parsing: Structured relational data for the matching engine ---
    @OneToMany(mappedBy ="profile" , cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Education> educationList;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkExperience> workExperienceList;

    @PreUpdate
    @PrePersist
    public void updateTime() {
        this.updatedAt = LocalDateTime.now();
    }
}
