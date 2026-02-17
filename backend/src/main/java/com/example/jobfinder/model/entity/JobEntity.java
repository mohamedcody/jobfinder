package com.example.jobfinder.model.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;


@Entity
@Table(name = "jobs", indexes = {
        @Index(name = "idx_job_title", columnList = "title"),
        @Index(name = "idx_job_location", columnList = "location")
})
@Getter@Setter@NoArgsConstructor@AllArgsConstructor
@Builder
public class JobEntity {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title ;
    private String location ;

    @Column(columnDefinition = "TEXT")
    private String description ;

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary ;


    @Column(name = "job_url", unique = true, nullable = false)
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




