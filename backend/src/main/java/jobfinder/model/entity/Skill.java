package jobfinder.model.entity;

import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "skills", indexes = {
        @Index(name = "idx_skill_name", columnList = "name", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String category;

    // --- Added for Scalability ---
    @Column(name = "is_approved")
    @Builder.Default
    private Boolean isApproved = true; // False if added by user and needs admin review

    // --- Added for Bidirectional Mapping & Cascade Deletion ---
    @OneToMany(mappedBy = "skill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserSkill> userSkills;

    @OneToMany(mappedBy = "skill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JobSkill> jobSkills;
}
