package jobfinder.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "work_experience", indexes = {
        @Index(name = "idx_work_experience_profile_id", columnList = "profile_id"),
        @Index(name = "idx_work_experience_job_title", columnList = "job_title")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private UserProfile profile;

    @Column(name = "company_name", length = 500)
    private String companyName;

    @Column(name = "job_title", length = 255)
    private String jobTitle;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date", length = 20)
    private String startDate;

    @Column(name = "end_date", length = 20)
    private String endDate;

    @Column(name = "is_current", nullable = false)
    @Builder.Default
    private Boolean isCurrent = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
