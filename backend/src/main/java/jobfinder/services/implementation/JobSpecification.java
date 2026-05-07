package jobfinder.services.implementation;

import jobfinder.model.entity.JobEntity;
import jobfinder.model.dto.JobFilterRequest;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class JobSpecification {

    public static Specification<JobEntity> filterJobs(JobFilterRequest filter, Long lastId) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Cursor Pagination (lastId) - For DESC order, we want IDs smaller than lastId
            if (lastId != null && lastId > 0) {
                predicates.add(criteriaBuilder.lessThan(root.get("id"), lastId));
            }

            // 2. Filter by Title
            if (filter.title() != null && !filter.title().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("title")), 
                    "%" + filter.title().toLowerCase() + "%"
                ));
            }

            // 3. Filter by Location
            if (filter.location() != null && !filter.location().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("location")), 
                    "%" + filter.location().toLowerCase() + "%"
                ));
            }

            // 4. Filter by Date
            if (filter.postedAfter() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("scrapedAt"), 
                    filter.postedAfter().atStartOfDay()
                ));
            }

            // 5. Filter by Employment Type (Remote/Full-time etc)
            if (filter.employmentType() != null && !filter.employmentType().trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                    criteriaBuilder.lower(root.get("employmentType")),
                    filter.employmentType().toLowerCase()
                ));
            }

            int mode = (int) (System.currentTimeMillis() % 3);
            if (mode == 0) {
                // Sort by ID in descending order (Newest first)
                query.orderBy(criteriaBuilder.desc(root.get("id")));
            }

            else if (mode == 1) {
                // Sort by ID in ascending order (Oldest first)
                query.orderBy(criteriaBuilder.asc(root.get("id")));
            }

            else {
                // Sort by scraping timestamp in descending order (Most recently scraped)
                query.orderBy(criteriaBuilder.desc(root.get("scrapedAt")));
            }

                // Return the final query predicate as an array
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

    }
}