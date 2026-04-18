package jobfinder.model.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;



@Entity
@Table(name = "jobs", indexes = {
        @Index(name = "idx_job_title", columnList = "title"),
        @Index(name = "idx_job_location", columnList = "location"),
        @Index(name = "idx_job_employment_type", columnList = "employment_type"),
        @Index(name = "idx_job_scraped_at", columnList = "scraped_at")
})
@Getter@Setter@NoArgsConstructor@AllArgsConstructor
@Builder
public class JobEntity {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title ;

    private String location ;

    @Column(name = "employment_type")
    private String employmentType;

    @Column(columnDefinition = "TEXT")
    private String description ;

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary ;


    @Column(name = "job_url", unique = true, nullable = false  , columnDefinition = "TEXT")
    private String jobUrl;


    @Column(name = "salary_range" )
    private String salaryRange;

    private String source ;



    @Builder.Default
    @Column(name="is_active")
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "scraped_at")
    private LocalDateTime scrapedAt = LocalDateTime.now();

   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "company_id")
  private CompanyEntity company;



}




