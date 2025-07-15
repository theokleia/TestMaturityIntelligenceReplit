-- ATMosFera Database Schema Dump
-- Generated for system documentation
-- This file contains the complete database schema for restoration

-- Create sequences
CREATE SEQUENCE IF NOT EXISTS assessment_templates_id_seq;
CREATE SEQUENCE IF NOT EXISTS assessments_id_seq;
CREATE SEQUENCE IF NOT EXISTS documents_id_seq;
CREATE SEQUENCE IF NOT EXISTS global_settings_id_seq;
CREATE SEQUENCE IF NOT EXISTS maturity_dimensions_id_seq;
CREATE SEQUENCE IF NOT EXISTS maturity_levels_id_seq;
CREATE SEQUENCE IF NOT EXISTS metrics_id_seq;
CREATE SEQUENCE IF NOT EXISTS projects_id_seq;
CREATE SEQUENCE IF NOT EXISTS recommendations_id_seq;
CREATE SEQUENCE IF NOT EXISTS test_cases_id_seq;
CREATE SEQUENCE IF NOT EXISTS test_cycle_items_id_seq;
CREATE SEQUENCE IF NOT EXISTS test_cycles_id_seq;
CREATE SEQUENCE IF NOT EXISTS test_runs_id_seq;
CREATE SEQUENCE IF NOT EXISTS test_suites_id_seq;
CREATE SEQUENCE IF NOT EXISTS users_id_seq;

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id INTEGER NOT NULL DEFAULT nextval('users_id_seq'::regclass) PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'user'::text
);

CREATE TABLE IF NOT EXISTS projects (
    id INTEGER NOT NULL DEFAULT nextval('projects_id_seq'::regclass) PRIMARY KEY,
    name CHARACTER VARYING(255) NOT NULL,
    description TEXT,
    jira_project_id CHARACTER VARYING(10),
    jira_jql TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    github_repo CHARACTER VARYING(100),
    jira_api_key TEXT,
    test_case_format CHARACTER VARYING(20) DEFAULT 'structured'::character varying,
    output_format CHARACTER VARYING(20) DEFAULT 'markdown'::character varying,
    jira_url TEXT,
    github_token TEXT,
    status CHARACTER VARYING(20) DEFAULT 'active'::character varying,
    jira_issue_type CHARACTER VARYING(50) DEFAULT 'Bug'::character varying,
    project_type CHARACTER VARYING(50),
    industry_area CHARACTER VARYING(100),
    regulations TEXT,
    tech_stack TEXT,
    target_audience TEXT,
    business_context TEXT,
    quality_focus TEXT,
    additional_context TEXT
);

CREATE TABLE IF NOT EXISTS maturity_dimensions (
    id INTEGER NOT NULL DEFAULT nextval('maturity_dimensions_id_seq'::regclass) PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    color TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    project_id INTEGER REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS maturity_levels (
    id INTEGER NOT NULL DEFAULT nextval('maturity_levels_id_seq'::regclass) PRIMARY KEY,
    dimension_id INTEGER NOT NULL REFERENCES maturity_dimensions(id),
    level INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    project_id INTEGER REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER NOT NULL DEFAULT nextval('metrics_id_seq'::regclass) PRIMARY KEY,
    name TEXT NOT NULL,
    value TEXT NOT NULL,
    previous_value TEXT,
    target_value TEXT,
    change TEXT,
    change_direction TEXT,
    is_positive BOOLEAN DEFAULT true,
    color TEXT,
    dimension_id INTEGER REFERENCES maturity_dimensions(id),
    project_id INTEGER REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER NOT NULL DEFAULT nextval('recommendations_id_seq'::regclass) PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL,
    priority TEXT DEFAULT 'normal'::text,
    dimension_id INTEGER REFERENCES maturity_dimensions(id),
    level_id INTEGER REFERENCES maturity_levels(id),
    actions JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active'::text,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    project_id INTEGER REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS assessment_templates (
    id INTEGER NOT NULL DEFAULT nextval('assessment_templates_id_seq'::regclass) PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    dimension_id INTEGER REFERENCES maturity_dimensions(id),
    criteria JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    project_id INTEGER REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS assessments (
    id INTEGER NOT NULL DEFAULT nextval('assessments_id_seq'::regclass) PRIMARY KEY,
    name TEXT NOT NULL,
    dimension_id INTEGER REFERENCES maturity_dimensions(id),
    template_id INTEGER REFERENCES assessment_templates(id),
    score INTEGER,
    score_percent INTEGER,
    status TEXT NOT NULL,
    scheduled_date TIMESTAMP WITHOUT TIME ZONE,
    completed_date TIMESTAMP WITHOUT TIME ZONE,
    user_id INTEGER REFERENCES users(id),
    results JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    project_id INTEGER REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS test_suites (
    id INTEGER NOT NULL DEFAULT nextval('test_suites_id_seq'::regclass) PRIMARY KEY,
    name CHARACTER VARYING(100) NOT NULL,
    description TEXT,
    type CHARACTER VARYING(50) NOT NULL,
    status CHARACTER VARYING(30) DEFAULT 'active'::character varying,
    priority CHARACTER VARYING(20) DEFAULT 'medium'::character varying,
    project_area CHARACTER VARYING(100),
    user_id INTEGER REFERENCES users(id),
    ai_generated BOOLEAN DEFAULT false,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    project_id INTEGER REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS test_cases (
    id INTEGER NOT NULL DEFAULT nextval('test_cases_id_seq'::regclass) PRIMARY KEY,
    title CHARACTER VARYING(200) NOT NULL,
    description TEXT,
    preconditions TEXT,
    steps JSONB DEFAULT '[]'::jsonb,
    expected_results TEXT,
    actual_results TEXT,
    priority CHARACTER VARYING(20) DEFAULT 'medium'::character varying,
    severity CHARACTER VARYING(20) DEFAULT 'normal'::character varying,
    status CHARACTER VARYING(30) DEFAULT 'draft'::character varying,
    suite_id INTEGER REFERENCES test_suites(id),
    user_id INTEGER REFERENCES users(id),
    ai_generated BOOLEAN DEFAULT false,
    automatable BOOLEAN,
    automation_status CHARACTER VARYING(30),
    test_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    project_id INTEGER REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS test_cycles (
    id INTEGER NOT NULL DEFAULT nextval('test_cycles_id_seq'::regclass) PRIMARY KEY,
    name CHARACTER VARYING(100) NOT NULL,
    description TEXT,
    status CHARACTER VARYING(30) DEFAULT 'created'::character varying,
    start_date TIMESTAMP WITHOUT TIME ZONE,
    end_date TIMESTAMP WITHOUT TIME ZONE,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    project_id INTEGER REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS test_cycle_items (
    id INTEGER NOT NULL DEFAULT nextval('test_cycle_items_id_seq'::regclass) PRIMARY KEY,
    cycle_id INTEGER NOT NULL REFERENCES test_cycles(id),
    test_case_id INTEGER NOT NULL REFERENCES test_cases(id),
    suite_id INTEGER REFERENCES test_suites(id),
    assigned_user_id INTEGER REFERENCES users(id),
    status CHARACTER VARYING(30) DEFAULT 'not-run'::character varying,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS test_runs (
    id INTEGER NOT NULL DEFAULT nextval('test_runs_id_seq'::regclass) PRIMARY KEY,
    cycle_item_id INTEGER NOT NULL REFERENCES test_cycle_items(id),
    executed_by INTEGER REFERENCES users(id),
    executed_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    duration INTEGER,
    status CHARACTER VARYING(30) NOT NULL,
    notes TEXT,
    evidence JSONB DEFAULT '[]'::jsonb,
    environment CHARACTER VARYING(50),
    version CHARACTER VARYING(50),
    step_results JSONB DEFAULT '[]'::jsonb,
    defects JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS documents (
    id INTEGER NOT NULL DEFAULT nextval('documents_id_seq'::regclass) PRIMARY KEY,
    title CHARACTER VARYING(255) NOT NULL,
    type CHARACTER VARYING(50) NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    project_id INTEGER REFERENCES projects(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tags TEXT[],
    version CHARACTER VARYING(50) DEFAULT '1.0'::character varying,
    status CHARACTER VARYING(20) DEFAULT 'draft'::character varying,
    ai_prompt TEXT
);

CREATE TABLE IF NOT EXISTS global_settings (
    id INTEGER NOT NULL DEFAULT nextval('global_settings_id_seq'::regclass) PRIMARY KEY,
    key CHARACTER VARYING(100) NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    category CHARACTER VARYING(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS session (
    sid CHARACTER VARYING NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- Insert default global settings
INSERT INTO global_settings (key, value, description, category) VALUES
('openai_api_key', '', 'OpenAI API key for AI features', 'AI'),
('openai_model', 'gpt-4o', 'OpenAI model to use for general AI features', 'AI'),
('anthropic_api_key', '', 'Anthropic API key for document generation', 'AI'),
('anthropic_model', 'claude-3-7-sonnet-20250219', 'Anthropic model to use for document generation', 'AI')
ON CONFLICT (key) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_test_cases_project_id ON test_cases(project_id);
CREATE INDEX IF NOT EXISTS idx_test_suites_project_id ON test_suites(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_session_expire ON session(expire);
CREATE INDEX IF NOT EXISTS idx_global_settings_category ON global_settings(category);

-- Update sequences to current max values (run after data import)
-- SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
-- SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));
-- Add similar statements for other sequences as needed