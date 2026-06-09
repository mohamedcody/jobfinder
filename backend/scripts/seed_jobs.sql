BEGIN;

-- Seed companies for test scenarios (idempotent by unique name)
INSERT INTO companies (name, logo_url, website_url, description)
VALUES
  ('TechCorp', 'https://logo.clearbit.com/github.com', 'https://techcorp.example', 'Product engineering company'),
  ('CloudNine', 'https://logo.clearbit.com/docker.com', 'https://cloudnine.example', 'Cloud and platform startup'),
  ('DataPulse', 'https://logo.clearbit.com/openai.com', 'https://datapulse.example', 'AI and analytics company'),
  ('FinVerse', 'https://logo.clearbit.com/stripe.com', 'https://finverse.example', 'Fintech solutions')
ON CONFLICT (name) DO UPDATE
SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  description = EXCLUDED.description;

-- Seed jobs for title/location/date/employmentType filter coverage
INSERT INTO jobs
  (title, location, employment_type, description, ai_summary, job_url, salary_range, source, is_active, scraped_at, company_id)
VALUES
  (
    'Senior React Developer',
    'Cairo, Egypt',
    'Full-time',
    'Build scalable React frontends with TypeScript and Next.js.',
    'Frontend role focused on performance and DX.',
    'https://jobs.example.com/techcorp/senior-react-developer',
    '$120k-$150k',
    'manual-seed',
    true,
    NOW() - INTERVAL '1 day',
    (SELECT id FROM companies WHERE name = 'TechCorp')
  ),
  (
    'Backend Java Engineer',
    'Remote',
    'Full-time',
    'Build Spring Boot services and PostgreSQL data flows.',
    'Backend services role for high-traffic APIs.',
    'https://jobs.example.com/cloudnine/backend-java-engineer',
    '$100k-$135k',
    'manual-seed',
    true,
    NOW() - INTERVAL '3 days',
    (SELECT id FROM companies WHERE name = 'CloudNine')
  ),
  (
    'UI UX Product Designer',
    'Alexandria, Egypt',
    'Contract',
    'Design modern SaaS dashboards and conversion-focused flows.',
    'Design role for product-led teams.',
    'https://jobs.example.com/datapulse/ui-ux-product-designer',
    '$70k-$95k',
    'manual-seed',
    true,
    NOW() - INTERVAL '6 days',
    (SELECT id FROM companies WHERE name = 'DataPulse')
  ),
  (
    'Frontend Engineer Next.js',
    'Remote',
    'Full-time',
    'Build App Router pages with strong accessibility and SEO.',
    'Frontend architecture role for Next.js app.',
    'https://jobs.example.com/techcorp/frontend-engineer-nextjs',
    '$110k-$145k',
    'manual-seed',
    true,
    NOW() - INTERVAL '10 days',
    (SELECT id FROM companies WHERE name = 'TechCorp')
  ),
  (
    'Data Analyst',
    'Giza, Egypt',
    'Part-time',
    'Analyze metrics and maintain BI dashboards.',
    'Data role supporting product decisions.',
    'https://jobs.example.com/finverse/data-analyst',
    '$60k-$85k',
    'manual-seed',
    true,
    NOW() - INTERVAL '14 days',
    (SELECT id FROM companies WHERE name = 'FinVerse')
  ),
  (
    'DevOps Engineer',
    'Dubai, UAE',
    'Full-time',
    'Maintain CI CD, observability, and Kubernetes platform.',
    'Infra role for cloud deployment pipelines.',
    'https://jobs.example.com/cloudnine/devops-engineer',
    '$115k-$140k',
    'manual-seed',
    true,
    NOW() - INTERVAL '20 days',
    (SELECT id FROM companies WHERE name = 'CloudNine')
  ),
  (
    'Junior React Developer',
    'Cairo, Egypt',
    'Internship',
    'Assist in building reusable React components.',
    'Entry-level frontend opportunity.',
    'https://jobs.example.com/datapulse/junior-react-developer',
    '$30k-$45k',
    'manual-seed',
    true,
    NOW() - INTERVAL '2 days',
    (SELECT id FROM companies WHERE name = 'DataPulse')
  ),
  (
    'Product Manager',
    'Remote',
    'Contract',
    'Own roadmap, backlog, and stakeholder alignment.',
    'Cross-functional product leadership role.',
    'https://jobs.example.com/finverse/product-manager',
    '$95k-$125k',
    'manual-seed',
    true,
    NOW() - INTERVAL '8 days',
    (SELECT id FROM companies WHERE name = 'FinVerse')
  )
ON CONFLICT (job_url) DO UPDATE
SET
  title = EXCLUDED.title,
  location = EXCLUDED.location,
  employment_type = EXCLUDED.employment_type,
  description = EXCLUDED.description,
  ai_summary = EXCLUDED.ai_summary,
  salary_range = EXCLUDED.salary_range,
  source = EXCLUDED.source,
  is_active = EXCLUDED.is_active,
  scraped_at = EXCLUDED.scraped_at,
  company_id = EXCLUDED.company_id;

COMMIT;
