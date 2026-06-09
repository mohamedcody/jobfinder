package jobfinder.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_skills", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "skill_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    // --- Added for Scalability & Precision ---
    @Column(name = "years_of_experience")
    private Integer yearsOfExperience; // e.g., 3 years in Java

    @Column(name = "proficiency_score")
    private Integer proficiencyScore; // 1 to 5 instead of String, makes AI math much easier
}
