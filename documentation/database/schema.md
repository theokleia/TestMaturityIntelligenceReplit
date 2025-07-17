# ATMosFera Database Schema Documentation

## 1. Overview

### 1.1 Database Architecture
ATMosFera uses PostgreSQL 13+ as the primary database with Drizzle ORM for type-safe database operations. The schema is designed for multi-tenant architecture with project-level data isolation.

### 1.2 Design Principles
- **Multi-tenant Security:** Complete data isolation between projects
- **Performance Optimization:** Strategic indexing and query optimization
- **Data Integrity:** Foreign key constraints and validation
- **Flexibility:** JSONB fields for dynamic data structures
- **Audit Trail:** Comprehensive change tracking

### 1.3 Naming Conventions
- Tables: Snake_case (e.g., `test_cases`, `maturity_dimensions`)
- Columns: Snake_case (e.g., `created_at`, `project_id`)
- Foreign Keys: `{table}_id` format (e.g., `project_id`, `user_id`)
- Indexes: `idx_{table}_{column}` format

## 2. Core Tables

### 2.1 Users Table
**Purpose:** User authentication and profile management

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Roles:**
- `admin`: System administration privileges
- `manager`: Project management capabilities
- `user`: Standard user access

### 2.2 Projects Table
**Purpose:** Multi-tenant project management and isolation

```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  project_type VARCHAR(30),
  industry_area VARCHAR(50),
  regulations VARCHAR(100),
  additional_context TEXT,
  quality_focus TEXT,
  test_strategy TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_type ON projects(project_type);
CREATE INDEX idx_projects_industry ON projects(industry_area);
```

**Project Types:**
- `Greenfield`: New development projects
- `Legacy`: Existing system maintenance
- `Migration`: System migration projects
- `Integration`: System integration projects

## 3. ATMF Framework Tables

### 3.1 Maturity Dimensions Table
**Purpose:** Define the 6 ATMF maturity dimensions

```sql
CREATE TABLE maturity_dimensions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  weight DECIMAL(3,2) DEFAULT 1.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data
INSERT INTO maturity_dimensions (name, description) VALUES
('Automation Intelligence', 'Test automation maturity and intelligent tooling'),
('Quality Engineering', 'Quality practices, culture, and engineering excellence'),
('Risk Management', 'Risk-based testing strategies and mitigation'),
('Process Optimization', 'Testing process efficiency and optimization'),
('Team Collaboration', 'Cross-functional collaboration and communication'),
('Continuous Improvement', 'Learning, adaptation, and evolution practices');
```

### 3.2 Maturity Levels Table
**Purpose:** Define the 5 maturity levels for each dimension

```sql
CREATE TABLE maturity_levels (
  id SERIAL PRIMARY KEY,
  dimension_id INTEGER REFERENCES maturity_dimensions(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  name VARCHAR(50) NOT NULL,
  description TEXT,
  criteria JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_maturity_levels_dimension ON maturity_levels(dimension_id);
CREATE INDEX idx_maturity_levels_level ON maturity_levels(level);
```

**Maturity Level Names:**
1. **Foundation:** Basic practices established
2. **Developing:** Practices becoming systematic
3. **Defined:** Standardized and documented practices
4. **Managed:** Quantitatively managed practices
5. **Optimizing:** Continuously improving practices

### 3.3 Assessments Table
**Purpose:** Store maturity assessment results and tracking

```sql
CREATE TABLE assessments (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  dimension_id INTEGER REFERENCES maturity_dimensions(id),
  current_level INTEGER CHECK (current_level BETWEEN 1 AND 5),
  target_level INTEGER CHECK (target_level BETWEEN 1 AND 5),
  evidence TEXT,
  notes TEXT,
  assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_assessments_project ON assessments(project_id);
CREATE INDEX idx_assessments_dimension ON assessments(dimension_id);
CREATE INDEX idx_assessments_date ON assessments(assessment_date);
```

## 4. Test Management Tables

### 4.1 Test Suites Table
**Purpose:** Organize test cases into logical groups

```sql
CREATE TABLE test_suites (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  project_area VARCHAR(50),
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(30) DEFAULT 'active',
  coverage_requirements JSONB DEFAULT '[]',
  ai_generated BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_test_suites_project ON test_suites(project_id);
CREATE INDEX idx_test_suites_status ON test_suites(status);
CREATE INDEX idx_test_suites_priority ON test_suites(priority);
CREATE INDEX idx_test_suites_area ON test_suites(project_area);
```

### 4.2 Test Cases Table
**Purpose:** Individual test case specifications and execution details

```sql
CREATE TABLE test_cases (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  preconditions TEXT,
  steps JSONB DEFAULT '[]',
  expected_results TEXT,
  actual_results TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  severity VARCHAR(20) DEFAULT 'normal',
  status VARCHAR(30) DEFAULT 'draft',
  suite_id INTEGER REFERENCES test_suites(id) ON DELETE SET NULL,
  user_id INTEGER REFERENCES users(id),
  ai_generated BOOLEAN DEFAULT false,
  automatable BOOLEAN,
  automation_status VARCHAR(30),
  test_data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_test_cases_project ON test_cases(project_id);
CREATE INDEX idx_test_cases_suite ON test_cases(suite_id);
CREATE INDEX idx_test_cases_status ON test_cases(status);
CREATE INDEX idx_test_cases_priority ON test_cases(priority);
CREATE INDEX idx_test_cases_ai_generated ON test_cases(ai_generated);
```

**Test Case Status Values:**
- `draft`: Initial creation state
- `ready`: Ready for execution
- `in-progress`: Currently being executed
- `passed`: Successfully executed
- `failed`: Execution failed
- `blocked`: Cannot be executed
- `deprecated`: No longer valid

### 4.3 Test Cycles Table
**Purpose:** Organize test execution periods and campaigns with AI-enhanced capabilities

```sql
CREATE TABLE test_cycles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(30) DEFAULT 'created',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  user_id INTEGER REFERENCES users(id),
  -- Enhanced fields for AI Assisted Execution Readiness
  testing_mode VARCHAR(30) DEFAULT 'manual',
  test_deployment_url TEXT,
  test_data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_test_cycles_project ON test_cycles(project_id);
CREATE INDEX idx_test_cycles_status ON test_cycles(status);
CREATE INDEX idx_test_cycles_dates ON test_cycles(start_date, end_date);
CREATE INDEX idx_test_cycles_testing_mode ON test_cycles(testing_mode);
```

**Test Cycle Status Values:**
- `created`: Newly created cycle
- `in-progress`: Currently executing
- `completed`: All tests executed
- `archived`: Archived for reference

**Testing Mode Values:**
- `manual`: Traditional manual testing
- `ai-assisted-manual`: AI-enhanced manual testing with intelligent suggestions
- `automated`: Fully automated test execution

**Test Data Structure:**
The `test_data` JSONB field stores structured test data as key-value pairs with descriptions:
```json
{
  "username": {
    "value": "test@example.com",
    "description": "Test user account for login scenarios"
  },
  "api_key": {
    "value": "sk-test-123",
    "description": "API key for external service integration testing"
  }
}
```

### 4.4 Test Cycle Items Table
**Purpose:** Link test cases to test cycles for execution tracking

```sql
CREATE TABLE test_cycle_items (
  id SERIAL PRIMARY KEY,
  cycle_id INTEGER NOT NULL REFERENCES test_cycles(id) ON DELETE CASCADE,
  test_case_id INTEGER NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
  suite_id INTEGER REFERENCES test_suites(id) ON DELETE SET NULL,
  assigned_user_id INTEGER REFERENCES users(id),
  status VARCHAR(30) DEFAULT 'not-run',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_test_cycle_items_cycle ON test_cycle_items(cycle_id);
CREATE INDEX idx_test_cycle_items_test_case ON test_cycle_items(test_case_id);
CREATE INDEX idx_test_cycle_items_status ON test_cycle_items(status);
CREATE UNIQUE INDEX idx_test_cycle_items_unique ON test_cycle_items(cycle_id, test_case_id);
```

### 4.5 Test Runs Table
**Purpose:** Record individual test execution results and history

```sql
CREATE TABLE test_runs (
  id SERIAL PRIMARY KEY,
  cycle_item_id INTEGER NOT NULL REFERENCES test_cycle_items(id) ON DELETE CASCADE,
  executed_by INTEGER REFERENCES users(id),
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration INTEGER, -- in seconds
  status VARCHAR(30) NOT NULL,
  notes TEXT,
  evidence JSONB DEFAULT '[]',
  environment VARCHAR(50),
  version VARCHAR(50),
  step_results JSONB DEFAULT '[]',
  defects JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]'
);

-- Indexes
CREATE INDEX idx_test_runs_cycle_item ON test_runs(cycle_item_id);
CREATE INDEX idx_test_runs_executed_by ON test_runs(executed_by);
CREATE INDEX idx_test_runs_status ON test_runs(status);
CREATE INDEX idx_test_runs_executed_at ON test_runs(executed_at);
```

## 5. Integration Tables

### 5.1 Jira Tickets Table
**Purpose:** Store synchronized Jira ticket data for analysis

```sql
CREATE TABLE jira_tickets (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  jira_key VARCHAR(50) NOT NULL,
  issue_type VARCHAR(50),
  summary TEXT NOT NULL,
  description TEXT,
  priority VARCHAR(50),
  status VARCHAR(50) NOT NULL,
  assignee VARCHAR(100),
  reporter VARCHAR(100),
  labels JSONB DEFAULT '[]',
  components JSONB DEFAULT '[]',
  created_date TIMESTAMP,
  updated_date TIMESTAMP,
  content_hash VARCHAR(64),
  last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_jira_tickets_project ON jira_tickets(project_id);
CREATE INDEX idx_jira_tickets_key ON jira_tickets(jira_key);
CREATE INDEX idx_jira_tickets_status ON jira_tickets(status);
CREATE INDEX idx_jira_tickets_sync ON jira_tickets(last_synced);
CREATE UNIQUE INDEX idx_jira_tickets_unique ON jira_tickets(project_id, jira_key);
```

### 5.2 Test Case Jira Links Table
**Purpose:** Link test cases to Jira tickets for coverage tracking

```sql
CREATE TABLE test_case_jira_links (
  id SERIAL PRIMARY KEY,
  test_case_id INTEGER REFERENCES test_cases(id) ON DELETE CASCADE,
  jira_ticket_id INTEGER REFERENCES jira_tickets(id) ON DELETE CASCADE,
  link_type VARCHAR(30) DEFAULT 'covers',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_jira_links_test_case ON test_case_jira_links(test_case_id);
CREATE INDEX idx_jira_links_jira_ticket ON test_case_jira_links(jira_ticket_id);
CREATE UNIQUE INDEX idx_jira_links_unique ON test_case_jira_links(test_case_id, jira_ticket_id);
```

### 5.3 Jira Sync Logs Table
**Purpose:** Track Jira synchronization activities and status

```sql
CREATE TABLE jira_sync_logs (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  sync_type VARCHAR(20) NOT NULL, -- 'full', 'incremental', 'manual'
  status VARCHAR(20) NOT NULL, -- 'pending', 'in_progress', 'completed', 'failed'
  tickets_processed INTEGER DEFAULT 0,
  tickets_created INTEGER DEFAULT 0,
  tickets_updated INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_jira_sync_logs_project ON jira_sync_logs(project_id);
CREATE INDEX idx_jira_sync_logs_status ON jira_sync_logs(status);
CREATE INDEX idx_jira_sync_logs_started ON jira_sync_logs(started_at);
```

## 6. AI and Analytics Tables

### 6.1 Recommendations Table
**Purpose:** Store AI-generated recommendations and insights

```sql
CREATE TABLE recommendations (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  priority VARCHAR(20) DEFAULT 'medium',
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  dimension_id INTEGER REFERENCES maturity_dimensions(id),
  status VARCHAR(30) DEFAULT 'active',
  ai_confidence DECIMAL(3,2),
  implementation_effort VARCHAR(20),
  expected_impact VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_recommendations_project ON recommendations(project_id);
CREATE INDEX idx_recommendations_dimension ON recommendations(dimension_id);
CREATE INDEX idx_recommendations_status ON recommendations(status);
CREATE INDEX idx_recommendations_priority ON recommendations(priority);
```

### 6.2 Metrics Table
**Purpose:** Store quantitative metrics for analytics and reporting

```sql
CREATE TABLE metrics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  value DECIMAL(10,4) NOT NULL,
  unit VARCHAR(20),
  category VARCHAR(50),
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  dimension_id INTEGER REFERENCES maturity_dimensions(id),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_metrics_project ON metrics(project_id);
CREATE INDEX idx_metrics_name ON metrics(name);
CREATE INDEX idx_metrics_category ON metrics(category);
CREATE INDEX idx_metrics_recorded ON metrics(recorded_at);
```

### 6.3 Documents Table
**Purpose:** Store AI-generated and user documents

```sql
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  tags JSONB DEFAULT '[]',
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  folder_id INTEGER REFERENCES document_folders(id) ON DELETE SET NULL,
  ai_generated BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  status VARCHAR(30) DEFAULT 'draft',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_folder ON documents(folder_id);
CREATE INDEX idx_documents_ai_generated ON documents(ai_generated);
```

## 7. Configuration Tables

### 7.1 Global Settings Table
**Purpose:** System-wide configuration and AI service settings

```sql
CREATE TABLE global_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_global_settings_key ON global_settings(key);
CREATE INDEX idx_global_settings_category ON global_settings(category);

-- Sample Configuration Data
INSERT INTO global_settings (key, value, description, category) VALUES
('openai_api_key', '', 'OpenAI API key for AI features', 'AI'),
('openai_model', 'gpt-4o', 'OpenAI model for general AI features', 'AI'),
('anthropic_api_key', '', 'Anthropic API key for document generation', 'AI'),
('anthropic_model', 'claude-3-7-sonnet-20250219', 'Anthropic model for documents', 'AI'),
('max_ai_requests_per_hour', '1000', 'Rate limit for AI API calls', 'AI'),
('session_timeout_hours', '24', 'User session timeout in hours', 'Security'),
('password_min_length', '8', 'Minimum password length requirement', 'Security');
```

## 8. Views and Procedures

### 8.1 Test Coverage View
**Purpose:** Comprehensive test coverage analysis

```sql
CREATE VIEW test_coverage_summary AS
SELECT 
  p.id as project_id,
  p.name as project_name,
  COUNT(DISTINCT jt.id) as total_jira_tickets,
  COUNT(DISTINCT tcjl.jira_ticket_id) as covered_tickets,
  COUNT(DISTINCT tc.id) as total_test_cases,
  ROUND(
    (COUNT(DISTINCT tcjl.jira_ticket_id)::DECIMAL / 
     NULLIF(COUNT(DISTINCT jt.id), 0)) * 100, 2
  ) as coverage_percentage
FROM projects p
LEFT JOIN jira_tickets jt ON p.id = jt.project_id
LEFT JOIN test_case_jira_links tcjl ON jt.id = tcjl.jira_ticket_id
LEFT JOIN test_cases tc ON p.id = tc.project_id
GROUP BY p.id, p.name;
```

### 8.2 Maturity Progress View
**Purpose:** Track ATMF maturity progression over time

```sql
CREATE VIEW maturity_progress AS
SELECT 
  p.id as project_id,
  p.name as project_name,
  md.name as dimension_name,
  a.current_level,
  a.target_level,
  a.assessment_date,
  ROW_NUMBER() OVER (
    PARTITION BY p.id, md.id 
    ORDER BY a.assessment_date DESC
  ) as latest_rank
FROM projects p
CROSS JOIN maturity_dimensions md
LEFT JOIN assessments a ON p.id = a.project_id AND md.id = a.dimension_id
ORDER BY p.id, md.id, a.assessment_date DESC;
```

### 8.3 Test Execution Summary View
**Purpose:** Comprehensive test execution metrics

```sql
CREATE VIEW test_execution_summary AS
SELECT 
  tc.id as cycle_id,
  tc.name as cycle_name,
  tc.project_id,
  COUNT(tci.id) as total_tests,
  COUNT(CASE WHEN tci.status = 'passed' THEN 1 END) as passed_tests,
  COUNT(CASE WHEN tci.status = 'failed' THEN 1 END) as failed_tests,
  COUNT(CASE WHEN tci.status = 'blocked' THEN 1 END) as blocked_tests,
  COUNT(CASE WHEN tci.status = 'not-run' THEN 1 END) as not_run_tests,
  ROUND(
    (COUNT(CASE WHEN tci.status = 'passed' THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(tci.id), 0)) * 100, 2
  ) as pass_rate
FROM test_cycles tc
LEFT JOIN test_cycle_items tci ON tc.id = tci.cycle_id
GROUP BY tc.id, tc.name, tc.project_id;
```

## 9. Security and Performance

### 9.1 Row Level Security (RLS)
**Purpose:** Enforce project-level data isolation

```sql
-- Enable RLS on key tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jira_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for project access
CREATE POLICY project_access_policy ON projects
  FOR ALL TO authenticated_users
  USING (
    id IN (
      SELECT project_id FROM user_project_access 
      WHERE user_id = current_user_id()
    )
  );
```

### 9.2 Performance Optimizations

#### Composite Indexes
```sql
-- Optimize common query patterns
CREATE INDEX idx_test_cases_project_status ON test_cases(project_id, status);
CREATE INDEX idx_test_cycle_items_cycle_status ON test_cycle_items(cycle_id, status);
CREATE INDEX idx_jira_tickets_project_status ON jira_tickets(project_id, status);
CREATE INDEX idx_assessments_project_dimension ON assessments(project_id, dimension_id);
```

#### Partial Indexes
```sql
-- Index only active records
CREATE INDEX idx_projects_active ON projects(id) WHERE status = 'active';
CREATE INDEX idx_test_cases_ready ON test_cases(id) WHERE status = 'ready';
CREATE INDEX idx_recommendations_active ON recommendations(id) WHERE status = 'active';
```

#### JSON Indexes
```sql
-- Optimize JSONB field queries
CREATE INDEX idx_test_cases_steps_gin ON test_cases USING GIN(steps);
CREATE INDEX idx_jira_tickets_labels_gin ON jira_tickets USING GIN(labels);
CREATE INDEX idx_documents_tags_gin ON documents USING GIN(tags);
```

## 10. Backup and Recovery

### 10.1 Backup Strategy
- **Full Backup:** Daily at 2 AM UTC
- **Incremental Backup:** Every 6 hours
- **Point-in-Time Recovery:** WAL archiving enabled
- **Retention:** 30 days for full backups, 7 days for incremental

### 10.2 Recovery Procedures
1. **Point-in-Time Recovery:** `pg_pitr` for specific timestamp recovery
2. **Table-Level Recovery:** Selective table restoration
3. **Data Validation:** Integrity checks post-recovery
4. **Performance Testing:** Validate system performance after recovery

## 11. Monitoring and Maintenance

### 11.1 Database Monitoring
- **Performance Metrics:** Query execution time, connection pool usage
- **Storage Metrics:** Disk usage, index bloat, table statistics
- **Replication Lag:** Monitor read replica synchronization
- **Lock Monitoring:** Detect and resolve lock contention

### 11.2 Maintenance Tasks
- **VACUUM and ANALYZE:** Automated weekly execution
- **Index Maintenance:** Monitor and rebuild fragmented indexes
- **Statistics Update:** Ensure query planner has current statistics
- **Log Rotation:** Manage PostgreSQL log files

---

**Document Version:** 1.0  
**Last Updated:** July 16, 2025  
**Next Review:** August 16, 2025  
**Database Version:** PostgreSQL 13+  
**Owner:** Database Engineering Team