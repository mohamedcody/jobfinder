
ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
    to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(employment_type, ''))
    ) STORED;


CREATE INDEX IF NOT EXISTS idx_jobs_search_vector
    ON jobs USING GIN(search_vector);


CREATE INDEX IF NOT EXISTS idx_job_id_desc
    ON jobs(id DESC)
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_job_scraped_at_desc
    ON jobs(scraped_at DESC)
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_jobs_filter_composite
    ON jobs(is_active, employment_type, location);

CREATE INDEX IF NOT EXISTS idx_company_name
    ON companies(name);


ANALYZE jobs;
ANALYZE companies;