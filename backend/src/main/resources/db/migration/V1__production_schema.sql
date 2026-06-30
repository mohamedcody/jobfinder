CREATE TABLE IF NOT EXISTS app_users (
                                         id BIGSERIAL PRIMARY KEY,
                                         username VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    lockout_time TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON app_users (email);
CREATE INDEX IF NOT EXISTS idx_users_username ON app_users (username);

CREATE TABLE IF NOT EXISTS companies (
                                         id BIGSERIAL PRIMARY KEY,
                                         name VARCHAR(255) NOT NULL UNIQUE,
    logo_url TEXT,
    website_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS jobs (
                                    id BIGSERIAL PRIMARY KEY,
                                    title VARCHAR(255),
    location VARCHAR(255),
    employment_type VARCHAR(255),
    description TEXT,
    ai_summary TEXT,
    job_url TEXT NOT NULL UNIQUE,
    salary_range VARCHAR(255),
    source VARCHAR(255),
    is_active BOOLEAN,
    scraped_at TIMESTAMPTZ,
    company_id BIGINT REFERENCES companies(id) ON DELETE SET NULL
    );

CREATE INDEX IF NOT EXISTS idx_job_title ON jobs (title);
CREATE INDEX IF NOT EXISTS idx_job_location ON jobs (location);
CREATE INDEX IF NOT EXISTS idx_job_employment_type ON jobs (employment_type);
CREATE INDEX IF NOT EXISTS idx_job_scraped_at ON jobs (scraped_at);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs (company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_active_scraped_id ON jobs (is_active, scraped_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS otp_codes (
                                         id BIGSERIAL PRIMARY KEY,
                                         user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,
    expiry_time TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_otp_user_code_status ON otp_codes (user_id, code, used);
CREATE INDEX IF NOT EXISTS idx_otp_user_created ON otp_codes (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS saved_jobs (
                                          id BIGSERIAL PRIMARY KEY,
                                          user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes VARCHAR(500),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uk_saved_jobs_user_job UNIQUE (user_id, job_id)
    );

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_active ON saved_jobs (user_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job ON saved_jobs (job_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_created ON saved_jobs (saved_at);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_restore ON saved_jobs (user_id, job_id, is_deleted);

CREATE TABLE IF NOT EXISTS user_profiles (
                                             id BIGSERIAL PRIMARY KEY,
                                             user_id BIGINT NOT NULL UNIQUE REFERENCES app_users(id) ON DELETE CASCADE,
    bio TEXT,
    city TEXT,
    country TEXT,
    currency VARCHAR(3),
    current_job_title TEXT,
    education_level VARCHAR(255),
    expected_salary NUMERIC(12,2),
    is_open_to_work BOOLEAN,
    resume_url TEXT,
    updated_at TIMESTAMPTZ,
    years_of_experience INTEGER
    );

CREATE TABLE IF NOT EXISTS user_preferences (
                                                id BIGSERIAL PRIMARY KEY,
                                                user_id BIGINT NOT NULL UNIQUE REFERENCES app_users(id) ON DELETE CASCADE,
    is_remote_only BOOLEAN,
    job_type VARCHAR(255),
    willing_to_relocate BOOLEAN
    );

CREATE TABLE IF NOT EXISTS user_pref_titles (
                                                preference_id BIGINT NOT NULL REFERENCES user_preferences(id) ON DELETE CASCADE,
    job_title VARCHAR(255)
    );

CREATE TABLE IF NOT EXISTS user_pref_locations (
                                                   preference_id BIGINT NOT NULL REFERENCES user_preferences(id) ON DELETE CASCADE,
    location VARCHAR(255)
    );

CREATE TABLE IF NOT EXISTS skills (
                                      id BIGSERIAL PRIMARY KEY,
                                      name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(255),
    is_approved BOOLEAN
    );

CREATE UNIQUE INDEX IF NOT EXISTS idx_skill_name ON skills (name);

CREATE TABLE IF NOT EXISTS user_skills (
                                           id BIGSERIAL PRIMARY KEY,
                                           user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    years_of_experience INTEGER,
    proficiency_score INTEGER,
    CONSTRAINT uk_user_skill UNIQUE(user_id, skill_id)
    );

CREATE TABLE IF NOT EXISTS job_skills (
                                          id BIGSERIAL PRIMARY KEY,
                                          job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    is_mandatory BOOLEAN,
    min_years_of_experience INTEGER,
    CONSTRAINT uk_job_skill UNIQUE(job_id, skill_id)
    );

CREATE TABLE IF NOT EXISTS user_interactions (
                                                 id BIGSERIAL PRIMARY KEY,
                                                 user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_interaction_user_job ON user_interactions(user_id, job_id);

CREATE TABLE IF NOT EXISTS email_alert_settings (
                                                    id BIGSERIAL PRIMARY KEY,
                                                    user_id BIGINT NOT NULL UNIQUE REFERENCES app_users(id) ON DELETE CASCADE,
    daily_digest_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    min_match_score INTEGER NOT NULL DEFAULT 60
    );

CREATE INDEX IF NOT EXISTS idx_email_alert_user ON email_alert_settings(user_id);