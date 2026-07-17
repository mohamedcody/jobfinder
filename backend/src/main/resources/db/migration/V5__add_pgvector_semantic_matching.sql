-- 1. Enable the pgvector extension for AI semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add vector columns to the jobs table (768 dimensions for Gemini embeddings)
ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS embedding vector(768),
    ADD COLUMN IF NOT EXISTS embedding_generated_at TIMESTAMPTZ;

-- 3. Add vector columns to the user_profiles table for CV embeddings
ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS embedding vector(768),
    ADD COLUMN IF NOT EXISTS embedding_generated_at TIMESTAMPTZ;

-- 4. Create HNSW indexes for blazing-fast Approximate Nearest Neighbor (ANN) search
CREATE INDEX IF NOT EXISTS idx_jobs_embedding_hnsw
    ON jobs
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_profiles_embedding_hnsw
    ON user_profiles
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);