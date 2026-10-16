package jobfinder.services.implementation;

import jobfinder.config.CustomUserDetails;
import jobfinder.model.entity.User;
import jobfinder.repository.JobRepository;
import jobfinder.repository.SavedJobRepository;
import jobfinder.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SavedJobServiceTest {

    @Mock
    private SavedJobRepository savedJobRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SavedJobService savedJobService;

    @BeforeEach
    void setUp() {
        CustomUserDetails userDetails = new CustomUserDetails(
                42L,
                "testuser",
                "password",
                true,
                true,
                List.of(() -> "ROLE_USER")
        );
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
        SecurityContextHolder.setContext(context);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("getSavedJobIds - returns empty list when input is null or empty")
    void testGetSavedJobIds_NullOrEmpty() {
        assertTrue(savedJobService.getSavedJobIds(null).isEmpty());
        assertTrue(savedJobService.getSavedJobIds(List.of()).isEmpty());
        verifyNoInteractions(savedJobRepository);
    }

    @Test
    @DisplayName("getSavedJobIds - calls single batch query on repository")
    void testGetSavedJobIds_BatchQuery() {
        List<Long> inputIds = List.of(1L, 2L, 3L);
        when(savedJobRepository.findSavedJobIds(42L, inputIds)).thenReturn(List.of(1L, 3L));

        List<Long> result = savedJobService.getSavedJobIds(inputIds);

        assertEquals(2, result.size());
        assertTrue(result.contains(1L));
        assertTrue(result.contains(3L));
        verify(savedJobRepository, times(1)).findSavedJobIds(42L, inputIds);
    }
}
