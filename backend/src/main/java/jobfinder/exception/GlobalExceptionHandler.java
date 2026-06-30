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
        // تسجيل الأخطاء المتوقعة كـ Warn لمتابعتها بدون ملء الـ Logs بتفاصيل ضخمة
        log.warn("Business Exception [{}] triggered at path: {}. Message: {}",
                ex.getErrorCode().getCode(), request.getRequestURI(), ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .errorCode(ex.getErrorCode().getCode())
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, ex.getErrorCode().getHttpStatus());
    }

    // 2. معالجة أخطاء المدخلات (Validation)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        log.warn("Validation failed at path: {} - Errors: {}", request.getRequestURI(), errorMessage);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .errorCode("ERR_VALIDATION_001")
                .message(errorMessage)
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // 2.5 معالجة أخطاء الـ @Validated (مثل @Max و @Min في الـ RequestParam)
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(ConstraintViolationException ex, HttpServletRequest request) {
        String errorMessage = ex.getConstraintViolations().stream()
                .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                .collect(Collectors.joining(", "));

        log.warn("Constraint validation failed at path: {} - Errors: {}", request.getRequestURI(), errorMessage);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .errorCode("ERR_VALIDATION_002")
                .message(errorMessage)
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // 3. خط الدفاع الأخير: معالجة الأخطاء غير المتوقعة (مثل أخطاء قاعدة البيانات أو الـ Runtime)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex, HttpServletRequest request) {

        // 👈 هذا هو السطر الأهم لحل مشكلة الـ Audit!
        // نقوم بطباعة الـ Stack Trace كاملاً في السيرفر لنعرف سبب المشكلة الحقيقي وحلها فوراً
        log.error("CRITICAL: Unexpected error occurred at path [{}]. Message: {}",
                request.getRequestURI(), ex.getMessage(), ex);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .errorCode("ERR_500")
                .message("An internal server error occurred. Please try again later.")
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}