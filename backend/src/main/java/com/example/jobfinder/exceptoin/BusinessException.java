package com.example.jobfinder.exceptoin;

public class BusinessException extends BaseException {
    
    public BusinessException(ErrorCode errorCode) {
        super(errorCode);
    }
    
    public BusinessException(ErrorCode errorCode, String customMessage) {
        super(errorCode, customMessage);
    }



}