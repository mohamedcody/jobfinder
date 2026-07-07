package jobfinder.exception;

/**
 * Thrown when the AI provider (Gemini) times out during CV data extraction.
 * This is distinct from a circuit breaker open state — it represents
 * an individual request exceeding the configured timeout threshold.
 */
public class AiServiceTimeoutException extends BaseException {

    public AiServiceTimeoutException(String message) {
        super(ErrorCode.AI_SERVICE_TIMEOUT, message);
    }

    public AiServiceTimeoutException(String message, Throwable cause) {
        super(ErrorCode.AI_SERVICE_TIMEOUT, message);
        initCause(cause);
    }
}
