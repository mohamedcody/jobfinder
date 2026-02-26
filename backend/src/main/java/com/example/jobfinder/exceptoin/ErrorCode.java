package jobfinder.exceptoin;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // Input Errors
    INVALID_INPUT("ERR_001", "Invalid input provided", HttpStatus.BAD_REQUEST),
    MISSING_PARAMETER("ERR_002", "Missing required parameter", HttpStatus.BAD_REQUEST),

    // Auth
    USER_NOT_FOUND("ERR_401", "User not found", HttpStatus.NOT_FOUND),
    EMAIL_ALREADY_EXISTS("ERR_402", "Email already exists", HttpStatus.CONFLICT),
    USERNAME_ALREADY_EXISTS("ERR_403", "Username already exists", HttpStatus.CONFLICT), // ✅ اتضافت
    INVALID_CREDENTIALS("ERR_404", "Wrong credentials", HttpStatus.UNAUTHORIZED),
    ACCOUNT_NOT_ACTIVATED("ERR_405", "Account not activated", HttpStatus.FORBIDDEN),

    // Business
    JOB_NOT_FOUND("ERR_101", "Job not found", HttpStatus.NOT_FOUND),
    DUPLICATE_JOB("ERR_103", "Job already exists", HttpStatus.CONFLICT),

    // External Services
    EXTERNAL_API_ERROR("ERR_201", "External service connection failed", HttpStatus.BAD_GATEWAY),
    APIFY_TIMEOUT("ERR_202", "External service timed out", HttpStatus.GATEWAY_TIMEOUT),

    // Database
    DATABASE_ERROR("ERR_301", "Database operation failed", HttpStatus.INTERNAL_SERVER_ERROR),

    // General
    INTERNAL_ERROR("ERR_999", "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),
    EMAIL_DOMAIN_NOT_ALLOWED("ERR_406", "Email domain not allowed", HttpStatus.BAD_REQUEST), // ✅

    // USER LOCKED
    ACCOUNT_LOCKED("ERR_407", "Account is locked due to too many failed attempts. Try again later.", HttpStatus.LOCKED);


    private final String code;
    private final String message;
    private final HttpStatus httpStatus;


    ErrorCode(String code, String message ,HttpStatus httpStatus ) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}