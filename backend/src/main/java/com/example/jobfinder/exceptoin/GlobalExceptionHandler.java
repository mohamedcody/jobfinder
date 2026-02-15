package com.example.jobfinder.exceptoin;


import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {



    @ExceptionHandler(BaseException.class)
      public ResponseEntity<ErrorResponse> handleBaseException(BaseException ex , HttpServletRequest request){


          // Building the error response
          ErrorResponse errorResponse = ErrorResponse.builder()
                  .errorCode(ex.getErrorCode().getCode())
                  .message(ex.getMessage())
                  .timestamp(LocalDateTime.now())
                  .path(request.getRequestURI())
                  .build();


          return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);

      }






}
