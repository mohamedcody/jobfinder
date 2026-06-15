package jobfinder.services.implementation;

import jakarta.transaction.Transactional;
import jobfinder.model.dto.SavedJobResponse;
import jobfinder.services.interfaces.jobSaveInterface;

import java.util.List;

public class SavedJobService implements jobSaveInterface {

    @Override
    public SavedJobResponse saveJobs(Long id, SavedJobResponse request) {
        return null;
    }

    @Override
    public void unSave(Long JobId) {

    }


    @Override
    public List<SavedJobResponse> getMySavedJobs() {
        return null;
    }
}
