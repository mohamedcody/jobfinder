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

            query.orderBy(criteriaBuilder.desc(root.get("id")));
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}