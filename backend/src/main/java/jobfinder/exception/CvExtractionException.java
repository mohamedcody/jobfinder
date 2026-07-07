package jobfinder.exception;

/**
 * Thrown when PDF text extraction fails due to corrupt files,
 * unsupported formats, or I/O errors during stream processing.
 */
public class CvExtractionException extends BaseException {

    public CvExtractionException(String message) {
        super(ErrorCode.CV_EXTRACTION_FAILED, message);
    }

    public CvExtractionException(String message, Throwable cause) {
        super(ErrorCode.CV_EXTRACTION_FAILED, message);
        initCause(cause);
    }
}
