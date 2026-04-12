package jobfinder.exception;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {


    INVALID_INPUT("ERR_001", "Invalid input provided", HttpStatus.BAD_REQUEST),
    MISSING_PARAMETER("ERR_002", "Missing required parameter", HttpStatus.BAD_REQUEST),

    // 🔐 Auth Errors (ERR_401 - ERR_450)
    USER_NOT_FOUND("ERR_401", "User not found", HttpStatus.NOT_FOUND),
    EMAIL_ALREADY_EXISTS("ERR_402", "Email already exists", HttpStatus.CONFLICT),
    USERNAME_ALREADY_EXISTS("ERR_403", "Username already exists", HttpStatus.CONFLICT),
    INVALID_CREDENTIALS("ERR_404", "Wrong credentials", HttpStatus.UNAUTHORIZED),
    ACCOUNT_NOT_ACTIVATED("ERR_405", "Account not activated", HttpStatus.FORBIDDEN),
    EMAIL_DOMAIN_NOT_ALLOWED("ERR_406", "Email domain not allowed", HttpStatus.BAD_REQUEST),
    ACCOUNT_LOCKED("ERR_407", "Account is locked due to too many failed attempts. Try again later.", HttpStatus.LOCKED),

    // ✅ Email Verification (ERR_410 - ERR_420)
    EMAIL_NOT_VERIFIED("ERR_410", "Email has not been verified - البريد الإلكتروني لم يتم التحقق منه", HttpStatus.FORBIDDEN),
    VERIFICATION_CODE_SENT("ERR_411", "Verification code sent to your email - تم إرسال كود التحقق إلى بريدك الإلكتروني", HttpStatus.OK),
    VERIFICATION_CODE_EXPIRED("ERR_412", "Verification code has expired - انتهت صلاحية كود التحقق", HttpStatus.BAD_REQUEST),
    INVALID_VERIFICATION_CODE("ERR_413", "Invalid verification code - كود التحقق غير صحيح", HttpStatus.BAD_REQUEST),
    MAX_OTP_ATTEMPTS_REACHED("ERR_436", "Maximum OTP attempts reached", HttpStatus.TOO_MANY_REQUESTS),
    EMAIL_VERIFIED_SUCCESSFULLY("ERR_414", "Email verified successfully - تم التحقق من البريد الإلكتروني بنجاح", HttpStatus.OK),

    // 🔒 Password & Security (ERR_430 - ERR_450)
    WEAK_PASSWORD("ERR_430", "Password is too weak - كلمة المرور ضعيفة جداً", HttpStatus.BAD_REQUEST),
    PASSWORD_TOO_COMMON("ERR_431", "This password is too common - كلمة المرور شائعة جداً", HttpStatus.BAD_REQUEST),
    PASSWORD_ALREADY_USED("ERR_432", "Password has been used before - تم استخدام كلمة المرور سابقاً", HttpStatus.BAD_REQUEST),
    PASSWORDS_DO_NOT_MATCH("ERR_433", "Passwords do not match - كلمات المرور غير متطابقة", HttpStatus.BAD_REQUEST),
    INVALID_OTP("ERR_434", "Invalid or wrong OTP code - كود OTP غير صحيح", HttpStatus.BAD_REQUEST),
    OTP_EXPIRED("ERR_435", "OTP code has expired - انتهت صلاحية كود OTP", HttpStatus.BAD_REQUEST),
    MAX_OTP_ATTEMPTS_EXCEEDED("ERR_436", "Maximum OTP attempts exceeded - تجاوزت الحد الأقصى لمحاولات OTP", HttpStatus.TOO_MANY_REQUESTS),
    PROVIDE_EMAIL("ERR_437", "Please provide an email address - يرجى تقديم عنوان بريد إلكتروني", HttpStatus.BAD_REQUEST),

    // 💼 Business Errors (ERR_101 - ERR_150)
    JOB_NOT_FOUND("ERR_101", "Job not found", HttpStatus.NOT_FOUND),
    DUPLICATE_JOB("ERR_103", "Job already exists", HttpStatus.CONFLICT),

    // 🌐 External Services (ERR_201 - ERR_250)
    EXTERNAL_API_ERROR("ERR_201", "External service connection failed", HttpStatus.BAD_GATEWAY),
    APIFY_TIMEOUT("ERR_202", "External service timed out", HttpStatus.GATEWAY_TIMEOUT),

    // 🗄️ Database Errors (ERR_301 - ERR_350)
    DATABASE_ERROR("ERR_301", "Database operation failed", HttpStatus.INTERNAL_SERVER_ERROR),

    // ⚠️ General Errors (ERR_999)
    INTERNAL_ERROR("ERR_999", "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);


    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}