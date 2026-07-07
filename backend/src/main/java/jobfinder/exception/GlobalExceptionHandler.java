package jobfinder.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j; // 👈 ضفنا مكتبة الـ Logging
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import jakarta.validation.ConstraintViolationException;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j // 👈 تفعيل الـ Logger على الكلاس
public class GlobalExceptionHandler {


    // 1. معالجة الأخطاء الخاصة بالـ Business (الأخطاء المتوقعة من قِبلنا)
    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ErrorResponse> handleBaseException(BaseException ex, HttpServletRequest request) {
        log.warn("Business Exception [{}] triggered at path: {}. Message: {}",
                ex.getErrorCode().getCode(), request.getRequestURI(), ex.getMessage());

        ErrorResponse errorResponse = new ErrorResponse(
                ex.getErrorCode().getCode(),
                ex.getMessage(),
                LocalDateTime.now(),
                request.getRequestURI()
        );

        return new ResponseEntity<>(errorResponse, ex.getErrorCode().getHttpStatus());
    }

    // 2. معالجة أخطاء المدخلات (Validation)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        log.warn("Validation failed at path: {} - Errors: {}", request.getRequestURI(), errorMessage);

        ErrorResponse errorResponse = new ErrorResponse(
                "ERR_VALIDATION_001",
                errorMessage,
                LocalDateTime.now(),
                request.getRequestURI()
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // 2.5 معالجة أخطاء الـ @Validated (مثل @Max و @Min في الـ RequestParam)
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(ConstraintViolationException ex, HttpServletRequest request) {
        String errorMessage = ex.getConstraintViolations().stream()
                .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                .collect(Collectors.joining(", "));

        log.warn("Constraint validation failed at path: {} - Errors: {}", request.getRequestURI(), errorMessage);

        ErrorResponse errorResponse = new ErrorResponse(
                "ERR_VALIDATION_002",
                errorMessage,
                LocalDateTime.now(),
                request.getRequestURI()
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // 3. CV Parsing: Malformed AI Response (logs raw output for debugging, returns clean 422)
    @ExceptionHandler(MalformedAiResponseException.class)
    public ResponseEntity<ErrorResponse> handleMalformedAiResponse(MalformedAiResponseException ex, HttpServletRequest request) {
        log.error("MALFORMED AI RESPONSE at path: [{}]. Raw AI output (truncated): {}",
                request.getRequestURI(),
                ex.getRawAiOutput() != null
                        ? ex.getRawAiOutput().substring(0, Math.min(ex.getRawAiOutput().length(), 2000))
                        : "null");

        ErrorResponse errorResponse = new ErrorResponse(
                ex.getErrorCode().getCode(),
                "The AI returned an invalid response. Please try uploading your CV again.",
                LocalDateTime.now(),
                request.getRequestURI()
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    // 4. خط الدفاع الأخير: معالجة الأخطاء غير المتوقعة (مثل أخطاء قاعدة البيانات أو الـ Runtime)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex, HttpServletRequest request) {
        log.error("CRITICAL: Unexpected error occurred at path [{}]. Message: {}",
                request.getRequestURI(), ex.getMessage(), ex);

        ErrorResponse errorResponse = new ErrorResponse(
                "ERR_500",
                "An internal server error occurred. Please try again later.",
                LocalDateTime.now(),
                request.getRequestURI()
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}