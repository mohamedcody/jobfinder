package jobfinder.services.interfaces;

import jobfinder.model.dto.CursorPageResponseDto;
import jobfinder.model.dto.JobFilterRequest;
import jobfinder.model.dto.JobResponseDTO;

public interface JobInterface {

    CursorPageResponseDto<JobResponseDTO> getJobsAdvanced(Long lastId, int size);

    CursorPageResponseDto<JobResponseDTO> searchJobs(String title, String location, Long lastId, int size);

    CursorPageResponseDto<JobResponseDTO> searchJobsByFilter(JobFilterRequest filter, Long lastId, int size);

    String generateAiSummary(Long jobId);

}