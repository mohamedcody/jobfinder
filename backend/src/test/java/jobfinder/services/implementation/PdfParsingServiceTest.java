package jobfinder.services.implementation;

import jobfinder.exception.CvExtractionException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PdfParsingServiceTest {

    private PdfParsingService pdfParsingService;

    @BeforeEach
    void setUp() {
        // The service has no dependencies, instantiate directly
        pdfParsingService = new PdfParsingService();
    }

    /**
     * Helper method to generate a valid in-memory PDF with specified text
     */
    private byte[] createValidPdfBytes(String text) throws IOException {
        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            document.addPage(page);
            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA, 12);
                contentStream.newLineAtOffset(100, 700);
                contentStream.showText(text);
                contentStream.endText();
            }
            document.save(baos);
            return baos.toByteArray();
        }
    }

    @Nested
    class FileValidationTests {

        @Test
        void extractText_nullFile_throwsException() {
            // Act & Assert
            assertThatThrownBy(() -> pdfParsingService.extractText(null))
                    .isInstanceOf(CvExtractionException.class)
                    .hasMessage("No file was uploaded. Please select a PDF file.");
        }

        @Test
        void extractText_emptyFile_throwsException() {
            // Arrange
            MockMultipartFile file = new MockMultipartFile(
                    "file", "test.pdf", "application/pdf", new byte[0]);

            // Act & Assert
            assertThatThrownBy(() -> pdfParsingService.extractText(file))
                    .isInstanceOf(CvExtractionException.class)
                    .hasMessage("No file was uploaded. Please select a PDF file.");
        }

        @Test
        void extractText_nonPdfContentType_throwsException() {
            // Arrange
            MockMultipartFile file = new MockMultipartFile(
                    "file", "test.png", "image/png", "dummy".getBytes());

            // Act & Assert
            assertThatThrownBy(() -> pdfParsingService.extractText(file))
                    .isInstanceOf(CvExtractionException.class)
                    .hasMessage("Invalid file type: 'image/png'. Only PDF files are accepted.");
        }

        @Test
        void extractText_nullContentType_throwsException() {
            // Arrange
            MockMultipartFile file = new MockMultipartFile(
                    "file", "test.pdf", null, "dummy".getBytes());

            // Act & Assert
            assertThatThrownBy(() -> pdfParsingService.extractText(file))
                    .isInstanceOf(CvExtractionException.class)
                    .hasMessage("Invalid file type: 'null'. Only PDF files are accepted.");
        }

        @Test
        void extractText_fileTooLarge_throwsException() {
            // Arrange
            MultipartFile file = mock(MultipartFile.class);
            when(file.isEmpty()).thenReturn(false);
            when(file.getContentType()).thenReturn("application/pdf");
            when(file.getSize()).thenReturn(10L * 1024 * 1024 + 1); // > 10MB

            // Act & Assert
            assertThatThrownBy(() -> pdfParsingService.extractText(file))
                    .isInstanceOf(CvExtractionException.class)
                    .hasMessage("File size exceeds the 10MB limit. Please upload a smaller file.");
        }
    }

    @Nested
    class ExtractionTests {

        @Test
        void extractText_validPdf_extractsTextCorrectly() throws IOException {
            // Arrange
            String expectedText = "Hello World PDF Content";
            byte[] pdfBytes = createValidPdfBytes(expectedText);
            MockMultipartFile file = new MockMultipartFile(
                    "file", "test.pdf", "application/pdf", pdfBytes);

            // Act
            String result = pdfParsingService.extractText(file);

            // Assert
            assertThat(result).isEqualTo(expectedText);
        }

        @Test
        void extractText_validPdf_trimsReturnedText() throws IOException {
            // Arrange
            String text = "   Text with spaces   ";
            byte[] pdfBytes = createValidPdfBytes(text);
            MockMultipartFile file = new MockMultipartFile(
                    "file", "test.pdf", "application/pdf", pdfBytes);

            // Act
            String result = pdfParsingService.extractText(file);

            // Assert
            // PDF text extraction might include trailing newlines, so trimmed result should match
            assertThat(result).isEqualTo("Text with spaces");
        }

        @Test
        void extractText_corruptedPdfBytes_throwsException() {
            // Arrange
            byte[] corruptedBytes = "This is not a valid PDF file".getBytes();
            MockMultipartFile file = new MockMultipartFile(
                    "file", "test.pdf", "application/pdf", corruptedBytes);

            // Act & Assert
            assertThatThrownBy(() -> pdfParsingService.extractText(file))
                    .isInstanceOf(CvExtractionException.class)
                    .hasMessage("Failed to process the uploaded CV. Please ensure it is a valid PDF file.");
        }

        @Test
        void extractText_pdfWithOnlyWhitespace_throwsException() throws IOException {
            // Arrange
            byte[] pdfBytes = createValidPdfBytes("    "); // Only spaces
            MockMultipartFile file = new MockMultipartFile(
                    "file", "empty.pdf", "application/pdf", pdfBytes);

            // Act & Assert
            assertThatThrownBy(() -> pdfParsingService.extractText(file))
                    .isInstanceOf(CvExtractionException.class)
                    .hasMessage("No text could be extracted from the PDF. The file may be a scanned image. Please upload a text-based PDF.");
        }
    }
}
