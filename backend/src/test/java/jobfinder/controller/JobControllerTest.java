package jobfinder.controller;

import jobfinder.model.dto.CursorPageResponseDto;
import jobfinder.model.dto.JobFilterRequest;
import jobfinder.model.dto.JobResponseDTO;
import jobfinder.services.implementation.JobService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobControllerTest {

    @Mock
    private JobService jobScraperService;

    @InjectMocks
    private JobController jobController;

    private JobResponseDTO createSampleJob(Long id, String title) {
        return JobResponseDTO.builder()
                .id(id)
                .title(title)
                .companyName("TechCorp")
                .location("Cairo, Egypt")
                .employmentType("Full-time")
                .build();
    }

    @Nested
    @DisplayName("GET /api/jobs")
    class GetAllJobsTests {

        @Test
        @DisplayName("Should return 200 with cursor paginated jobs")
        void getAllJobs_happyPath() {
            List<JobResponseDTO> jobs = List.of(createSampleJob(1L, "Software Engineer"));
            CursorPageResponseDto<JobResponseDTO> page = new CursorPageResponseDto<>(jobs, 10, 1L, false);

            when(jobScraperService.getJobsAdvanced(isNull(), eq(10))).thenReturn(page);

            ResponseEntity<CursorPageResponseDto<JobResponseDTO>> response = jobController.getAllJobs(null, 10);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().data()).hasSize(1);
            assertThat(response.getBody().data().get(0).getTitle()).isEqualTo("Software Engineer");
            verify(jobScraperService).getJobsAdvanced(null, 10);
        }

        @Test
        @DisplayName("Should pass lastId and custom page size")
        void getAllJobs_withPaginationParams() {
            CursorPageResponseDto<JobResponseDTO> page = new CursorPageResponseDto<>(Collections.emptyList(), 25, null, false);
            when(jobScraperService.getJobsAdvanced(eq(100L), eq(25))).thenReturn(page);

            ResponseEntity<CursorPageResponseDto<JobResponseDTO>> response = jobController.getAllJobs(100L, 25);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().data()).isEmpty();
            verify(jobScraperService).getJobsAdvanced(100L, 25);
        }
    }

    @Nested
    @DisplayName("GET /api/jobs/search (deprecated)")
    class SearchJobsTests {

        @Test
        @DisplayName("Should return matching jobs for title and location")
        void searchJobs_happyPath() {
            List<JobResponseDTO> jobs = List.of(createSampleJob(2L, "Java Developer"));
            CursorPageResponseDto<JobResponseDTO> page = new CursorPageResponseDto<>(jobs, 10, 2L, false);

            when(jobScraperService.searchJobs("Java", "Cairo", null, 10)).thenReturn(page);

            ResponseEntity<CursorPageResponseDto<JobResponseDTO>> response = jobController.searchJobs("Java", "Cairo", null, 10);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().data()).hasSize(1);
            assertThat(response.getBody().data().get(0).getTitle()).isEqualTo("Java Developer");
        }
    }

    @Nested
    @DisplayName("GET /api/jobs/filter")
    class FilterJobsTests {

        @Test
        @DisplayName("Should query jobs by filter without refreshing cache")
        void filterJobs_withoutRefresh() {
            LocalDate postedAfter = LocalDate.of(2026, 10, 1);
            List<JobResponseDTO> jobs = List.of(createSampleJob(3L, "DevOps Engineer"));
            CursorPageResponseDto<JobResponseDTO> page = new CursorPageResponseDto<>(jobs, 15, 3L, false);

            when(jobScraperService.searchJobsByFilter(any(JobFilterRequest.class), eq(50L), eq(15))).thenReturn(page);

            ResponseEntity<CursorPageResponseDto<JobResponseDTO>> response = jobController.filterJobs(
                    "DevOps", "Alexandria", postedAfter, "15000", "Full-time", 50L, 15, false, null
            );

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().data()).hasSize(1);
            verify(jobScraperService, never()).evictJobsCache();

            ArgumentCaptor<JobFilterRequest> captor = ArgumentCaptor.forClass(JobFilterRequest.class);
            verify(jobScraperService).searchJobsByFilter(captor.capture(), eq(50L), eq(15));
            JobFilterRequest captured = captor.getValue();
            assertThat(captured.title()).isEqualTo("DevOps");
            assertThat(captured.location()).isEqualTo("Alexandria");
            assertThat(captured.postedAfter()).isEqualTo(postedAfter);
            assertThat(captured.minSalary()).isEqualTo("15000");
            assertThat(captured.employmentType()).isEqualTo("Full-time");
        }

        @Test
        @DisplayName("Should evict cache when admin requests refresh=true")
        void filterJobs_admin_triggersEvictCache() {
            Authentication auth = mock(Authentication.class);
            doReturn(List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))).when(auth).getAuthorities();

            CursorPageResponseDto<JobResponseDTO> page = new CursorPageResponseDto<>(Collections.emptyList(), 10, null, false);
            when(jobScraperService.searchJobsByFilter(any(JobFilterRequest.class), isNull(), eq(10))).thenReturn(page);

            ResponseEntity<CursorPageResponseDto<JobResponseDTO>> response = jobController.filterJobs(
                    null, null, null, null, null, null, 10, true, auth
            );

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            verify(jobScraperService).evictJobsCache();
        }

        @Test
        @DisplayName("Should not evict cache when non-admin requests refresh=true")
        void filterJobs_nonAdmin_doesNotEvictCache() {
            Authentication auth = mock(Authentication.class);
            doReturn(List.of(new SimpleGrantedAuthority("ROLE_USER"))).when(auth).getAuthorities();

            CursorPageResponseDto<JobResponseDTO> page = new CursorPageResponseDto<>(Collections.emptyList(), 10, null, false);
            when(jobScraperService.searchJobsByFilter(any(JobFilterRequest.class), isNull(), eq(10))).thenReturn(page);

            ResponseEntity<CursorPageResponseDto<JobResponseDTO>> response = jobController.filterJobs(
                    null, null, null, null, null, null, 10, true, auth
            );

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            verify(jobScraperService, never()).evictJobsCache();
        }
    }

    @Nested
    @DisplayName("POST /api/jobs/{id}/summarize")
    class SummarizeJobTests {

        @Test
        @DisplayName("Should return generated AI summary for job")
        void summarizeJob_happyPath() {
            when(jobScraperService.generateAiSummary(42L)).thenReturn("Concise AI summary of the position.");

            ResponseEntity<Map<String, String>> response = jobController.summarizeJob(42L);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody()).containsEntry("summary", "Concise AI summary of the position.");
            verify(jobScraperService).generateAiSummary(42L);
        }
    }
}
