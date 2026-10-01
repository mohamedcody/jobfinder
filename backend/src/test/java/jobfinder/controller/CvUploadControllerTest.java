package jobfinder.controller;

import jobfinder.config.CustomUserDetails;
import jobfinder.model.dto.AiCvExtractionResult;
import jobfinder.model.dto.CvConfirmRequest;
import jobfinder.model.dto.CvParseResponseDto;
import jobfinder.services.ServiceAi.CvAiExtractionService;
import jobfinder.services.implementation.PdfParsingService;
import jobfinder.services.implementation.ProfileDataMapper;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CvUploadControllerTest {

    @Mock
    private PdfParsingService pdfParsingService;

    @Mock
    private CvAiExtractionService cvAiExtractionService;

    @Mock
    private ProfileDataMapper profileDataMapper;

    @InjectMocks
    private CvUploadController cvUploadController;

    private CustomUserDetails mockUserDetails(Long id) {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn(id);
        return userDetails;
    }

    @Nested
    class UploadEndpoint {
        
        @Test
        void uploadCv_happyPath_returns200WithParsedData() {
            // Arrange
            MultipartFile mockFile = mock(MultipartFile.class);
            CustomUserDetails userDetails = mockUserDetails(1L);
            when(pdfParsingService.extractText(mockFile)).thenReturn("Extracted Text");

            AiCvExtractionResult aiResult = new AiCvExtractionResult(
                    "John Doe", "john@example.com", "123456789",
                    "Software Engineer", "Bio", 5, "Bachelor",
                    "New York", "USA",
                    List.of(new AiCvExtractionResult.SkillEntry("Java", 4, 5)),
                    List.of(new AiCvExtractionResult.EducationEntry("University", "BSc", "CS", 2015, 2019, "A")),
                    List.of(new AiCvExtractionResult.WorkExperienceEntry("Tech Corp", "Dev", "Coding", "2019-01", "2023-01", false)),
                    Collections.emptyList(), Collections.emptyList()
            );

            when(cvAiExtractionService.extractCvData("Extracted Text")).thenReturn(Mono.just(aiResult));

            // Act & Assert
            Mono<ResponseEntity<CvParseResponseDto>> responseMono = cvUploadController.uploadCv(mockFile, userDetails);
            
            StepVerifier.create(responseMono)
                    .consumeNextWith(response -> {
                        assertThat(response.getStatusCode().value()).isEqualTo(200);
                        assertThat(response.getBody()).isNotNull();
                        assertThat(response.getBody().fullName()).isEqualTo("John Doe");
                        assertThat(response.getBody().skills()).hasSize(1);
                        assertThat(response.getBody().skills().get(0).name()).isEqualTo("Java");
                    })
                    .verifyComplete();
        }

        @Test
        void uploadCv_pdfExtractionFails_throwsExceptionSynchronously() {
            // Arrange
            MultipartFile mockFile = mock(MultipartFile.class);
            CustomUserDetails userDetails = mockUserDetails(1L);
            RuntimeException extractionException = new RuntimeException("PDF parse error");
            when(pdfParsingService.extractText(mockFile)).thenThrow(extractionException);

            // Act & Assert
            assertThatThrownBy(() -> cvUploadController.uploadCv(mockFile, userDetails))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("PDF parse error");
            
            verifyNoInteractions(cvAiExtractionService);
        }

        @Test
        void uploadCv_aiExtractionFails_returns503WithEmptyBody() {
            // Arrange
            MultipartFile mockFile = mock(MultipartFile.class);
            CustomUserDetails userDetails = mockUserDetails(1L);
            when(pdfParsingService.extractText(mockFile)).thenReturn("Extracted Text");
            when(cvAiExtractionService.extractCvData(anyString())).thenReturn(Mono.error(new RuntimeException("AI error")));

            // Act
            Mono<ResponseEntity<CvParseResponseDto>> responseMono = cvUploadController.uploadCv(mockFile, userDetails);

            // Assert
            StepVerifier.create(responseMono)
                    .consumeNextWith(response -> {
                        assertThat(response.getStatusCode().value()).isEqualTo(503);
                        assertThat(response.getBody()).isNull();
                    })
                    .verifyComplete();
        }

        @Test
        void uploadCv_503ResponseHasNoBody() {
            // Arrange
            MultipartFile mockFile = mock(MultipartFile.class);
            CustomUserDetails userDetails = mockUserDetails(1L);
            when(pdfParsingService.extractText(mockFile)).thenReturn("Extracted Text");
            when(cvAiExtractionService.extractCvData(anyString())).thenReturn(Mono.error(new RuntimeException("AI Error")));

            // Act
            ResponseEntity<CvParseResponseDto> response = cvUploadController.uploadCv(mockFile, userDetails).block();

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getStatusCode().value()).isEqualTo(503);
            assertThat(response.getBody()).isNull();
        }

        @Test
        void uploadCv_nullSkillsInAiResult_returnsEmptySkillsList() {
            // Arrange
            MultipartFile mockFile = mock(MultipartFile.class);
            CustomUserDetails userDetails = mockUserDetails(1L);
            when(pdfParsingService.extractText(mockFile)).thenReturn("Text");

            AiCvExtractionResult aiResult = new AiCvExtractionResult(
                    "John", "email", "123", "Title", "Bio", 5, "Level",
                    "City", "Country", null, Collections.emptyList(), Collections.emptyList(),
                    Collections.emptyList(), Collections.emptyList()
            );
            when(cvAiExtractionService.extractCvData("Text")).thenReturn(Mono.just(aiResult));

            // Act
            ResponseEntity<CvParseResponseDto> response = cvUploadController.uploadCv(mockFile, userDetails).block();

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getBody().skills()).isEmpty();
        }

        @Test
        void uploadCv_skillsWithBlankNames_filteredFromResponse() {
            // Arrange
            MultipartFile mockFile = mock(MultipartFile.class);
            CustomUserDetails userDetails = mockUserDetails(1L);
            when(pdfParsingService.extractText(mockFile)).thenReturn("Text");

            AiCvExtractionResult aiResult = new AiCvExtractionResult(
                    "John", "email", "123", "Title", "Bio", 5, "Level",
                    "City", "Country",
                    List.of(
                            new AiCvExtractionResult.SkillEntry("Java", 9, 5),
                            new AiCvExtractionResult.SkillEntry("", 9, 5),
                            new AiCvExtractionResult.SkillEntry(null, 9, 5),
                            new AiCvExtractionResult.SkillEntry("  ", 9, 5)
                    ),
                    Collections.emptyList(), Collections.emptyList(),
                    Collections.emptyList(), Collections.emptyList()
            );
            when(cvAiExtractionService.extractCvData("Text")).thenReturn(Mono.just(aiResult));

            // Act
            ResponseEntity<CvParseResponseDto> response = cvUploadController.uploadCv(mockFile, userDetails).block();

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getBody().skills()).hasSize(1);
            assertThat(response.getBody().skills().get(0).name()).isEqualTo("Java");
        }

        @Test
        void uploadCv_nullEducationInAiResult_returnsEmptyList() {
            // Arrange
            MultipartFile mockFile = mock(MultipartFile.class);
            CustomUserDetails userDetails = mockUserDetails(1L);
            when(pdfParsingService.extractText(mockFile)).thenReturn("Text");

            AiCvExtractionResult aiResult = new AiCvExtractionResult(
                    "John", "email", "123", "Title", "Bio", 5, "Level",
                    "City", "Country", Collections.emptyList(), null, Collections.emptyList(),
                    Collections.emptyList(), Collections.emptyList()
            );
            when(cvAiExtractionService.extractCvData("Text")).thenReturn(Mono.just(aiResult));

            // Act
            ResponseEntity<CvParseResponseDto> response = cvUploadController.uploadCv(mockFile, userDetails).block();

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getBody().education()).isEmpty();
        }
    }

    @Nested
    class ConfirmEndpoint {

        @Test
        void confirmCvSave_happyPath_returns200() {
            // Arrange
            CustomUserDetails userDetails = mockUserDetails(100L);
            CvConfirmRequest request = new CvConfirmRequest(
                    "Software Engineer", "My Bio", "MSc", 5, "Paris", "France",
                    List.of(new CvConfirmRequest.SkillEntry("Java", 8, 4)),
                    List.of(new CvConfirmRequest.EducationEntry("Univ", "BSc", "CS", 2010, 2014, "A")),
                    List.of(new CvConfirmRequest.WorkExperienceEntry("Company", "Title", "Desc", "2014-01", "2020-01", false))
            );

            CvParseResponseDto expectedResponse = mock(CvParseResponseDto.class);
            when(profileDataMapper.mapAndSave(any(AiCvExtractionResult.class), eq(100L))).thenReturn(expectedResponse);

            // Act
            ResponseEntity<CvParseResponseDto> response = cvUploadController.confirmCvSave(request, userDetails);

            // Assert
            assertThat(response.getStatusCode().value()).isEqualTo(200);
            assertThat(response.getBody()).isEqualTo(expectedResponse);
            verify(profileDataMapper).mapAndSave(any(AiCvExtractionResult.class), eq(100L));
        }

        @Test
        void confirmCvSave_passesUserIdFromJwt_notFromRequestBody() {
            // Arrange
            CustomUserDetails userDetails = mockUserDetails(99L);
            CvConfirmRequest request = new CvConfirmRequest(
                    "Software Engineer", "My Bio", "MSc", 5, "Paris", "France",
                    Collections.emptyList(), Collections.emptyList(), Collections.emptyList()
            );

            // Act
            cvUploadController.confirmCvSave(request, userDetails);

            // Assert
            verify(profileDataMapper).mapAndSave(any(AiCvExtractionResult.class), eq(99L));
        }

        @Test
        void confirmCvSave_setsFullNameToNull_inAiResult() {
            // Arrange
            CustomUserDetails userDetails = mockUserDetails(100L);
            CvConfirmRequest request = new CvConfirmRequest(
                    "Software Engineer", "My Bio", "MSc", 5, "Paris", "France",
                    Collections.emptyList(), Collections.emptyList(), Collections.emptyList()
            );

            ArgumentCaptor<AiCvExtractionResult> aiResultCaptor = ArgumentCaptor.forClass(AiCvExtractionResult.class);

            // Act
            cvUploadController.confirmCvSave(request, userDetails);

            // Assert
            verify(profileDataMapper).mapAndSave(aiResultCaptor.capture(), eq(100L));
            AiCvExtractionResult passedResult = aiResultCaptor.getValue();
            assertThat(passedResult.fullName()).isNull();
        }

        @Test
        void confirmCvSave_setsPhoneToNull_inAiResult() {
            // Arrange
            CustomUserDetails userDetails = mockUserDetails(100L);
            CvConfirmRequest request = new CvConfirmRequest(
                    "Software Engineer", "My Bio", "MSc", 5, "Paris", "France",
                    Collections.emptyList(), Collections.emptyList(), Collections.emptyList()
            );

            ArgumentCaptor<AiCvExtractionResult> aiResultCaptor = ArgumentCaptor.forClass(AiCvExtractionResult.class);

            // Act
            cvUploadController.confirmCvSave(request, userDetails);

            // Assert
            verify(profileDataMapper).mapAndSave(aiResultCaptor.capture(), eq(100L));
            AiCvExtractionResult passedResult = aiResultCaptor.getValue();
            assertThat(passedResult.phone()).isNull();
        }

        @Test
        void confirmCvSave_nullSkillsInRequest_passesEmptyList() {
            // Arrange
            CustomUserDetails userDetails = mockUserDetails(100L);
            CvConfirmRequest request = new CvConfirmRequest(
                    "Software Engineer", "My Bio", "MSc", 5, "Paris", "France",
                    null, Collections.emptyList(), Collections.emptyList()
            );

            ArgumentCaptor<AiCvExtractionResult> aiResultCaptor = ArgumentCaptor.forClass(AiCvExtractionResult.class);

            // Act
            cvUploadController.confirmCvSave(request, userDetails);

            // Assert
            verify(profileDataMapper).mapAndSave(aiResultCaptor.capture(), eq(100L));
            AiCvExtractionResult passedResult = aiResultCaptor.getValue();
            assertThat(passedResult.skills()).isEmpty();
        }

        @Test
        void confirmCvSave_isCurrentNull_defaultsToFalse() {
            // Arrange
            CustomUserDetails userDetails = mockUserDetails(100L);
            CvConfirmRequest request = new CvConfirmRequest(
                    "Software Engineer", "My Bio", "MSc", 5, "Paris", "France",
                    Collections.emptyList(), Collections.emptyList(),
                    List.of(new CvConfirmRequest.WorkExperienceEntry("Company", "Title", "Desc", "2014", "2020", null))
            );

            ArgumentCaptor<AiCvExtractionResult> aiResultCaptor = ArgumentCaptor.forClass(AiCvExtractionResult.class);

            // Act
            cvUploadController.confirmCvSave(request, userDetails);

            // Assert
            verify(profileDataMapper).mapAndSave(aiResultCaptor.capture(), eq(100L));
            AiCvExtractionResult passedResult = aiResultCaptor.getValue();
            assertThat(passedResult.workExperience()).hasSize(1);
            assertThat(passedResult.workExperience().get(0).isCurrent()).isFalse();
        }
    }
}
