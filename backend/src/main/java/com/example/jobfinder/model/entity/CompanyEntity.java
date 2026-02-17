package com.example.jobfinder.model.entity;
import jakarta.persistence.*;
import lombok.*;
import java.sql.Timestamp;

@Entity
@Table (name = "companies")
@Getter
@Setter
@AllArgsConstructor@NoArgsConstructor@Builder
public class CompanyEntity {



    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;;

    @Column(unique = true , nullable = false )
    private String name ;


    @Column(name  = "logo_url" , columnDefinition = "TEXT")
    private String logoUrl ;

    @Column(  name = "website_url",columnDefinition = "TEXT")
    private String websiteUrl ;



    @Column(name = "description" , columnDefinition = "TEXT")
    private String description  ;


    @Builder.Default
    @Column(name = "created_at")
    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());


}

