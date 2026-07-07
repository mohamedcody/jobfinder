-- ==========================================================
-- V4: CV Parsing Module - Education, Work Experience & JSONB
-- ==========================================================

-- 1. Add JSONB column to user_profiles for raw AI output backup
ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS cv_raw_data JSONB,
    ADD COLUMN IF NOT EXISTS cv_parsed_at TIMESTAMP;

-- 2. Education table (normalized for fast querying by the matching engine)
CREATE TABLE IF NOT EXISTS education (
    id              BIGSERIAL PRIMARY KEY,
    profile_id      BIGINT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    institution     VARCHAR(500),
    degree          VARCHAR(255),
    field_of_study  VARCHAR(255),
    start_year      INTEGER,
    end_year        INTEGER,
    grade           VARCHAR(100),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_education_profile_id ON education(profile_id);
CREATE INDEX idx_education_degree ON education(degree);

-- 3. Work Experience table
CREATE TABLE IF NOT EXISTS work_experience (
    id              BIGSERIAL PRIMARY KEY,
    profile_id      BIGINT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    company_name    VARCHAR(500),
    job_title       VARCHAR(255),
    description     TEXT,
    start_date      VARCHAR(20),
    end_date        VARCHAR(20),
    is_current      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_work_experience_profile_id ON work_experience(profile_id);
CREATE INDEX idx_work_experience_job_title ON work_experience(job_title);
