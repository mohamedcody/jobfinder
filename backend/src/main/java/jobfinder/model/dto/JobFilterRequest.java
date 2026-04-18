package jobfinder.model.dto;

import java.time.LocalDate;

public record JobFilterRequest(
        String title,
        String location,
        String minSalary,
        LocalDate postedAfter,
        String employmentType
) {
}
