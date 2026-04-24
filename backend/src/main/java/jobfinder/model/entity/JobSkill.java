package jobfinder.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "job_skills", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"job_id", "skill_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private JobEntity job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "is_mandatory")
    @Builder.Default
    private Boolean isMandatory = false;

    // --- Added for Scalability & Precision ---
    @Column(name = "min_years_of_experience")
    private Integer minYearsOfExperience; // Required years for this specific skill
}
