package jobfinder.services.implementation;

import jakarta.transaction.Transactional;
import jobfinder.config.CustomUserDetails;
import jobfinder.exception.BaseException;
import jobfinder.exception.ErrorCode;
import jobfinder.model.dto.SavedJobResponse;
import jobfinder.model.dto.SaveJobRequest;
import jobfinder.model.entity.JobEntity;
import jobfinder.model.entity.SavedJob;
import jobfinder.repository.JobRepository;
import jobfinder.repository.SavedJobRepository;
import jobfinder.repository.UserRepository;
import jobfinder.services.interfaces.jobSaveInterface;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SavedJobService implements jobSaveInterface {

    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    private static final int MAX_SAVED_JOBS = 100;

    @Override
    @Transactional
    public SavedJobResponse saveJob(Long jobId, SaveJobRequest request) {
        Long currentUserId = getCurrentUserId();

        JobEntity job = jobRepository.findById(jobId)
                .orElseThrow(() -> new BaseException(ErrorCode.JOB_NOT_FOUND, "Job not found: " + jobId));

        SavedJob savedJob = savedJobRepository.findByUser_IdAndJob_Id(currentUserId, jobId)
                .orElse(null);

        if (savedJob != null && !savedJob.isDeleted()) {
            if (request != null) {
                savedJob.setNotes(request.getNotes());
            }
            return toResponse(savedJob, job);
        }

        long count = savedJobRepository.countSavedJobsByUserId(currentUserId);
        if (count >= MAX_SAVED_JOBS) {
            throw new BaseException(ErrorCode.INVALID_INPUT, "You can save up to " + MAX_SAVED_JOBS + " jobs only.");
        }

        if (savedJob == null) {
            savedJob = new SavedJob();
            savedJob.setUser(userRepository.getReferenceById(currentUserId));
            savedJob.setJob(job);
        }

        savedJob.setNotes(request != null ? request.getNotes() : savedJob.getNotes());
        savedJob.setDeleted(false);
        savedJob.setSavedAt(LocalDateTime.now());

        try {
            savedJob = savedJobRepository.save(savedJob);
        } catch (DataIntegrityViolationException e) {
            SavedJob existing = savedJobRepository.findByUser_IdAndJob_Id(currentUserId, jobId)
                    .orElseThrow(() -> e);
            existing.setDeleted(false);
            if (request != null) {
                existing.setNotes(request.getNotes());
            }
            savedJob = savedJobRepository.save(existing);
        }

        log.info("✅ Job {} saved by user {}", jobId, currentUserId);

        return toResponse(savedJob, job);
    }

    @Override
    @Transactional
    public void unSaveJob(Long jobId) {
        Long currentUserId = getCurrentUserId();

        // ✅ softDelete بـ UPDATE query مباشرة — مش بنجيب الـ entity ومش بنعمل DELETE
        int updated = savedJobRepository.softDeleteByUserIdAndJobId(currentUserId, jobId);

        if (updated == 0) {
            log.debug("Job {} was already unsaved for user {}", jobId, currentUserId);
            return;
        }

        log.info("🗑️ Job {} unsaved by user {}", jobId, currentUserId);
    }

    @Override
    public List<SavedJobResponse> getMySavedJobs() {
        // ✅ JPQL Projection — بيجيب الـ DTOs مباشرة من الـ DB بدون تحويل في الـ Java
        return savedJobRepository.findAllSavedJobsByUserId(getCurrentUserId());
    }

    @Override
    public boolean isJobSaved(Long jobId) {
        return savedJobRepository.isJobSaved(getCurrentUserId(), jobId);
    }

    @Override
    public List<Long> getSavedJobIds(List<Long> jobIds) {
        if (jobIds == null || jobIds.isEmpty()) {
            return List.of();
        }

        List<Long> distinctJobIds = new LinkedHashSet<>(jobIds).stream()
                .filter(id -> id != null && id > 0)
                .limit(200)
                .toList();

        if (distinctJobIds.isEmpty()) {
            return List.of();
        }

        return savedJobRepository.findSavedJobIdsByUserIdAndJobIds(getCurrentUserId(), distinctJobIds);
    }


    private SavedJobResponse toResponse(SavedJob savedJob, JobEntity job) {
        return SavedJobResponse.builder()
                .savedJobId(savedJob.getId())
                .jobId(job.getId())
                .jobTitle(job.getTitle())
                .companyName(job.getCompany() != null ? job.getCompany().getName() : null)
                .companyLogo(job.getCompany() != null ? job.getCompany().getLogoUrl() : null)
                .location(job.getLocation())
                .jobUrl(job.getJobUrl())
                .employmentType(job.getEmploymentType())
                .savedAt(savedJob.getSavedAt())
                .notes(savedJob.getNotes())
                .build();
    }

    // ✅ مفيش داعي لأي DB query هنا: الـ id موجود جاهز جوه الـ principal من وقت الـ authentication
    // (الفرق عن النسخة القديمة اللي كانت بتعمل findByEmail كل مرة)
    private Long getCurrentUserId() {
        CustomUserDetails principal = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return principal.getId();
    }
}