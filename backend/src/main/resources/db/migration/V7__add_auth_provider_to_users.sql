ALTER TABLE app_users ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'LOCAL' NOT NULL;
ALTER TABLE app_users ADD COLUMN provider_id VARCHAR(255);

CREATE UNIQUE INDEX idx_users_provider ON app_users (auth_provider, provider_id) WHERE provider_id IS NOT NULL;
