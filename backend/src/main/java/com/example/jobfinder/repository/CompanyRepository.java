package com.example.jobfinder.repository;
import com.example.jobfinder.model.entity.CompanyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<CompanyEntity , Long > {

    Optional<CompanyEntity> findByName(String name );


}
