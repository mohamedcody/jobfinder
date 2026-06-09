package jobfinder.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "user_preferences")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // --- Enhanced: Better lists instead of raw comma-separated strings ---
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "user_pref_titles", joinColumns = @JoinColumn(name = "preference_id"))
    @Column(name = "job_title")
    private List<String> preferredJobTitles;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "user_pref_locations", joinColumns = @JoinColumn(name = "preference_id"))
    @Column(name = "location")
    private List<String> preferredLocations;

    @Column(name = "is_remote_only")
    @Builder.Default
    private Boolean isRemoteOnly = false;

    @Column(name = "job_type")
    private String jobType; // "FULL_TIME", "PART_TIME", "CONTRACT"

    @Column(name = "willing_to_relocate")
    @Builder.Default
    private Boolean willingToRelocate = false;
}
