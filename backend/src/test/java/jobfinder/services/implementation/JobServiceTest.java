package jobfinder.services.implementation;

import jobfinder.model.dto.CursorPageResponseDto;
import jobfinder.model.dto.JobFilterRequest;
import jobfinder.model.dto.JobResponseDTO;
import jobfinder.model.entity.CompanyEntity;
import jobfinder.model.entity.JobEntity;
import jobfinder.repository.CompanyRepository;
import jobfinder.repository.JobRepository;
import jobfinder.services.ServiceAi.AiService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private AiService aiService;

    @Mock
    private WebClient webClient;

    @Mock
    private CacheManager cacheManager;

    @InjectMocks
    private JobService jobService;

    private JobEntity createMockJob(Long id, String title) {
        CompanyEntity company = CompanyEntity.builder()
                .id(100L + id)
                .name("Tech Corp")
                .logoUrl("http://logo.com")
                .build();

        return JobEntity.builder()
                .id(id)
                .title(title)
                .location("Remote")
                .employmentType("Full-time")
                .jobUrl("http://example.com/jobs/" + id)
                .isActive(true)
                .scrapedAt(LocalDateTime.now())
                .company(company)
                .build();
    }

    @Test
    @DisplayName("searchJobsByFilter returns empty response when no jobs found")
    void searchJobsByFilter_WhenEmpty_ReturnsEmptyResult() {
        when(jobRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        JobFilterRequest filter = new JobFilterRequest("Java", "Remote", null, null, "Full-time");
        CursorPageResponseDto<JobResponseDTO> response = jobService.searchJobsByFilter(filter, null, 10);

        assertNotNull(response);
        assertTrue(response.data().isEmpty());
        assertFalse(response.hasNext());
        assertNull(response.nextCursor());
        assertEquals(10, response.pageSize());
    }

    @Test
    @DisplayName("searchJobsByFilter returns hasNext=false and nextCursor=null when results <= limit")
    void searchJobsByFilter_WhenResultsLessOrEqualLimit_ReturnsNullNextCursor() {
        List<JobEntity> jobs = List.of(
                createMockJob(10L, "Java Dev 1"),
                createMockJob(9L, "Java Dev 2")
        );
        when(jobRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(jobs));

        JobFilterRequest filter = new JobFilterRequest("Java", null, null, null, null);
        CursorPageResponseDto<JobResponseDTO> response = jobService.searchJobsByFilter(filter, null, 5);

        assertNotNull(response);
        assertEquals(2, response.data().size());
        assertFalse(response.hasNext());
        assertNull(response.nextCursor(), "nextCursor must be null when hasNext is false");
        assertEquals("Tech Corp", response.data().get(0).getCompanyName());
    }

    @Test
    @DisplayName("searchJobsByFilter returns hasNext=true and correct nextCursor when results > limit")
    void searchJobsByFilter_WhenResultsGreaterThanLimit_ReturnsNextCursor() {
        // limit is 2, repository returns 3 items (limit + 1)
        List<JobEntity> jobs = List.of(
                createMockJob(15L, "Java Lead"),
                createMockJob(14L, "Java Senior"),
                createMockJob(12L, "Java Junior")
        );
        when(jobRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(jobs));

        JobFilterRequest filter = new JobFilterRequest("Java", null, null, null, null);
        CursorPageResponseDto<JobResponseDTO> response = jobService.searchJobsByFilter(filter, null, 2);

        assertNotNull(response);
        assertEquals(2, response.data().size(), "Only requested limit items should be returned");
        assertTrue(response.hasNext());
        assertEquals(14L, response.nextCursor(), "nextCursor must be the ID of the last element in final content");
    }

    @Test
    @DisplayName("searchJobs returns empty response when title is blank")
    void searchJobs_WhenTitleIsBlank_ReturnsEmpty() {
        CursorPageResponseDto<JobResponseDTO> response = jobService.searchJobs("   ", "Remote", null, 10);

        assertNotNull(response);
        assertTrue(response.data().isEmpty());
        assertFalse(response.hasNext());
        assertNull(response.nextCursor());
    }

    @Test
    @DisplayName("searchJobs returns nextCursor when hasNext is true")
    void searchJobs_WhenHasNext_ReturnsValidCursor() {
        List<JobEntity> results = List.of(
                createMockJob(20L, "React Dev 1"),
                createMockJob(19L, "React Dev 2"),
                createMockJob(18L, "React Dev 3")
        );
        when(jobRepository.searchJobsFullText("React", "Cairo", null, 3))
                .thenReturn(results);

        CursorPageResponseDto<JobResponseDTO> response = jobService.searchJobs("React", "Cairo", null, 2);

        assertNotNull(response);
        assertEquals(2, response.data().size());
        assertTrue(response.hasNext());
        assertEquals(19L, response.nextCursor());
    }
}
