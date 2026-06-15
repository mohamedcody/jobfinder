package jobfinder.services.interfaces;

import jobfinder.model.dto.SavedJobResponse;
import jobfinder.repository.SavedJobRepository;

import java.util.List;

public interface jobSaveInterface {


    SavedJobResponse saveJobs(Long id , SavedJobResponse request);

    void unSave(Long JobId);


    List<SavedJobResponse> getMySavedJobs() ;

}
