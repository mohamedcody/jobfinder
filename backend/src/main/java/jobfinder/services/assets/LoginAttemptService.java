package jobfinder.services.assets;

import jobfinder.model.entity.User;
import jobfinder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j // Enables SLF4J logging for this class
public class LoginAttemptService {

    private final UserRepository userRepository;

    /**
     * Increments failed login attempts for a user.
     * Locks the account for 3 minutes if attempts reach 5.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateFailedAttempts(String identifier) {
        User user = userRepository.findByEmailOrUsername(identifier)
                .orElse(null);


        if (user == null) {
            // Log a warning if the user doesn't exist to avoid revealing info via errors
            log.warn("Skipping failed-attempt update: user not found for identifier={}", identifier);
            return;
        }

        userRepository.incrementFailedAttemptsAndLock(user.getId(), LocalDateTime.now().plusMinutes(3));
    }




    /**
     * Resets failed attempts and unlocks the account after a successful login.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void resetAttempts(String identifier) {
        User user = userRepository.findByEmailOrUsername(identifier)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.resetFailedAttempts(user.getId());
    }

}