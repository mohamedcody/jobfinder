CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_job_title_trgm
    ON jobs USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_job_location_trgm
    ON jobs USING GIN (location gin_trgm_ops);