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

        // ✅ نتأكد إن الوظيفة موجودة بـ findById (فيها SELECT فعلي)
        JobEntity job = jobRepository.findById(jobId)
                .orElseThrow(() -> new BaseException(ErrorCode.JOB_NOT_FOUND, "Job not found: " + jobId));

        // ✅ نشيك إذا كانت محفوظة قبل كده بـ query خفيفة (EXISTS)
        if (savedJobRepository.isJobSaved(currentUserId, jobId)) {
            throw new BaseException(ErrorCode.INVALID_INPUT, "Job already saved.");
        }

        // ✅ Limit عشان منسمحش بـ unlimited saves
        long count = savedJobRepository.countSavedJobsByUserId(currentUserId);
        if (count >= MAX_SAVED_JOBS) {
            throw new BaseException(ErrorCode.INVALID_INPUT, "You can save up to " + MAX_SAVED_JOBS + " jobs only.");
        }

        // ✅ لو فيه row قديم اتعمله soft delete (unsave قبل كده) بنرجّعه بدل ما ننشئ row جديد
        // كده مفيش تراكم rows ميتة، وكل user+job ليهم row واحد بس طول الوقت
        SavedJob savedJob = savedJobRepository.findByUser_IdAndJob_Id(currentUserId, jobId)
                .orElseGet(SavedJob::new);

        boolean isNewSave = savedJob.getId() == null;

        savedJob.setUser(userRepository.getReferenceById(currentUserId));
        savedJob.setJob(job);
        savedJob.setNotes(request != null ? request.getNotes() : null);

        if (isNewSave) {
            savedJob.setSavedAt(LocalDateTime.now());
        }

        savedJob.setDeleted(false);
        try {
            savedJobRepository.save(savedJob);
        } catch (DataIntegrityViolationException e) {
            // ✅ لو حصل race condition (two requests في نفس اللحظة) الـ unique constraint
            // على الـ DB هيرفض الـ insert التاني، ونحولها لرسالة واضحة بدل ما تبقى 500
            throw new BaseException(ErrorCode.INVALID_INPUT, "Job already saved.");
        }

        log.info("✅ Job {} saved by user {}", jobId, currentUserId);

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

    @Override
    @Transactional
    public void unSaveJob(Long jobId) {
        Long currentUserId = getCurrentUserId();

        // ✅ softDelete بـ UPDATE query مباشرة — مش بنجيب الـ entity ومش بنعمل DELETE
        int updated = savedJobRepository.softDeleteByUserIdAndJobId(currentUserId, jobId);

        if (updated == 0) {
            throw new BaseException(ErrorCode.INVALID_INPUT, "Saved job not found.");
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
        Long userId = getCurrentUserId();
        return jobIds.stream()
                .filter(jobId -> savedJobRepository.isJobSaved(userId, jobId))
                .toList();
    }



    // ✅ مفيش داعي لأي DB query هنا: الـ id موجود جاهز جوه الـ principal من وقت الـ authentication
    // (الفرق عن النسخة القديمة اللي كانت بتعمل findByEmail كل مرة)
    private Long getCurrentUserId() {
        CustomUserDetails principal = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return principal.getId();
    }
}