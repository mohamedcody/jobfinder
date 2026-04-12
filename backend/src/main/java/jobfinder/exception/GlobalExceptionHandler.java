package jobfinder.exception;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {



    @ExceptionHandler(BaseException.class)
      public ResponseEntity<ErrorResponse> handleBaseException(BaseException ex , HttpServletRequest request){
          ErrorResponse errorResponse = ErrorResponse.builder()
                  .errorCode(ex.getErrorCode().getCode())
                  .message(ex.getMessage())
                  .timestamp(LocalDateTime.now())
                  .path(request.getRequestURI())
                  .build();

          return new ResponseEntity<>(errorResponse, ex.getErrorCode().getHttpStatus());

      }



    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {
        // بنجمع كل أخطاء الحقول ونحطها في رسالة واحدة واضحة
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        ErrorResponse errorResponse = ErrorResponse.builder()
                .errorCode("ERR_VALIDATION_001") // كود خاص بأخطاء المدخلات
                .message(errorMessage)
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // 3. دي "حائط الصد": لو حصل أي خطأ غير متوقع في السيستم (NullPointer مثلاً)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex, HttpServletRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .errorCode("ERR_500")
                .message("An internal server error occurred. Please try again later.")
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }




}
