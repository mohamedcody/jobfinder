package jobfinder.services.interfaces;

import jobfinder.model.dto.CursorPageResponse;
import jobfinder.model.dto.JobFilterRequest;
import jobfinder.model.dto.JobResponseDTO;

public interface JobInterface {

    CursorPageResponse<JobResponseDTO> getJobsAdvanced(Long lastId, int size);

    CursorPageResponse<JobResponseDTO> searchJobs(String title, String location, Long lastId, int size);

    CursorPageResponse<JobResponseDTO> searchJobsByFilter(JobFilterRequest filter, Long lastId, int size);

    String generateAiSummary(Long jobId);

}