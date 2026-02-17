package com.example.jobfinder.exceptoin;

import lombok.Getter;

@Getter
public enum ErrorCode {


    // Input Errors
    INVALID_INPUT("ERR_001", "Invalid input provided"),
    MISSING_PARAMETER("ERR_002", "Missing required parameter"),

    // Business Logic
    JOB_NOT_FOUND("ERR_101", "Job not found"),
    COMPANY_NOT_FOUND("ERR_102", "Company not found"),
    DUPLICATE_JOB("ERR_103", "Job already exists in the database"),

    // External Services
    EXTERNAL_API_ERROR("ERR_201", "External service connection failed"),
    APIFY_TIMEOUT("ERR_202", "External service timed out"),

    // Database
    DATABASE_ERROR("ERR_301", "Database operation failed"),

    // General
    INTERNAL_ERROR("ERR_999", "Internal server error");


    private final String code;

    private final String message;
    
    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }
}