package jobfinder.services.implementation;

import jobfinder.exception.CvExtractionException;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

/**
 * Service responsible for extracting raw text content from uploaded PDF files.
 *
 * RESOURCE MANAGEMENT:
 * - Processes MultipartFile via InputStream directly (no temp file copy).
 * - Uses try-with-resources for both InputStream and PDDocument to prevent memory leaks.
 * - PDFTextStripper is lightweight and does not hold resources.
 */
@Service
@Slf4j
public class PdfParsingService {


    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

    /**
     * Extracts text from a PDF MultipartFile using Apache PDFBox.
     *
     * @param file the uploaded PDF file
     * @return extracted raw text content
     * @throws CvExtractionException if the file is invalid, too large, or cannot be parsed
     */
    public String extractText(MultipartFile file) {
        validateFile(file);

        log.info("📄 Starting PDF text extraction. File: '{}', Size: {} bytes", file.getOriginalFilename(), file.getSize());

        // try-with-resources ensures both InputStream and PDDocument are closed properly
        try (InputStream inputStream = file.getInputStream();
             PDDocument document = PDDocument.load(inputStream)) {


            if (document.isEncrypted()) {
                throw new CvExtractionException("The uploaded PDF is encrypted/password-protected. Please upload an unprotected file.");
            }

            PDFTextStripper stripper = new PDFTextStripper();
            String extractedText = stripper.getText(document);

            if (extractedText == null || extractedText.trim().isEmpty()) {
                throw new CvExtractionException(
                        "No text could be extracted from the PDF. The file may be a scanned image. Please upload a text-based PDF."
                );
            }

            log.info("✅ PDF text extraction complete. Extracted {} characters from '{}'",
                    extractedText.length(), file.getOriginalFilename());

            return extractedText.trim();

        } catch (CvExtractionException e) {
            // Re-throw our own exceptions without wrapping
            throw e;
        } catch (Exception e) {
            log.error("❌ Failed to parse PDF file '{}': {}", file.getOriginalFilename(), e.getMessage(), e);
            throw new CvExtractionException(
                    "Failed to process the uploaded CV. Please ensure it is a valid PDF file.", e
            );
        }
    }

    /**
     * Validates the uploaded file before processing.
     */
    //
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new CvExtractionException("No file was uploaded. Please select a PDF file.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new CvExtractionException(
                    "Invalid file type: '" + contentType + "'. Only PDF files are accepted."
            );
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new CvExtractionException(
                    "File size exceeds the 10MB limit. Please upload a smaller file."
            );
        }
    }
    /**
     * user Upload
     *
     * Validate File
     *
     * Open PDF
     *
     * Extract Text
     */
}
