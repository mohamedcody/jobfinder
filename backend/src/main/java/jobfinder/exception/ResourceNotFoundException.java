package jobfinder.exception;

/**
 * Exception thrown when a specific resource cannot be found.
 * Examples: User not found, Profile not found, Job not found.
 */
public class ResourceNotFoundException extends BaseException {

    /**
     * Constructor with ErrorCode only.
     * @param errorCode the error code
     */
    public ResourceNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }

    /**
     * Constructor with a custom message.
     * @param message the custom message
     */
    public ResourceNotFoundException(String message) {
        super(ErrorCode.USER_NOT_FOUND, message);
    }

    /**
     * Constructor with ErrorCode and a custom message.
     * @param errorCode the error code
     * @param customMessage the custom message
     */
    public ResourceNotFoundException(ErrorCode errorCode, String customMessage) {
        super(errorCode, customMessage);
    }
}

