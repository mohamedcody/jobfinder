package jobfinder.services.interfaces;

import jobfinder.model.dto.SaveJobRequest;
import jobfinder.model.dto.SavedJobResponse;

import java.util.List;

public interface jobSaveInterface {

    SavedJobResponse saveJob(Long jobId, SaveJobRequest request);

    void unSaveJob(Long jobId);

    List<SavedJobResponse> getMySavedJobs();

    boolean isJobSaved(Long jobId);

    // ✅ جديد: بيرجع بس الـ jobIds المحفوظة من ضمن اللستة اللي الفرونت اند بعتها
    // مفيد جداً لصفحات القوائم: query واحد بدل واحد لكل وظيفة ظاهرة في الصفحة
    List<Long> getSavedJobIds(List<Long> jobIds);
}