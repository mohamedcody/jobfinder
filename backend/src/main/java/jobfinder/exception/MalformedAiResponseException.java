package jobfinder.exception;

/**
 * Thrown when the AI returns a response that cannot be deserialized
 * into the expected JSON structure (AiCvExtractionResult).
 *
 * The raw AI output is logged for debugging before this exception is raised.
 */
public class MalformedAiResponseException extends BaseException {

    private final String rawAiOutput;

    public MalformedAiResponseException(String message, String rawAiOutput) {
        super(ErrorCode.MALFORMED_AI_RESPONSE, message);
        this.rawAiOutput = rawAiOutput;
    }

    public MalformedAiResponseException(String message, String rawAiOutput, Throwable cause) {
        super(ErrorCode.MALFORMED_AI_RESPONSE, message);
        this.rawAiOutput = rawAiOutput;
        initCause(cause);
    }

    public String getRawAiOutput() {
        return rawAiOutput;
    }
}
