# ATMosFera Project Documentation

## Overview
ATMosFera is an advanced AI-powered test management and documentation platform built around the Adaptive Testing Maturity Framework (ATMF). The platform helps teams assess their testing maturity, plan improvements, visualize testing practices in an interactive mindmap, and receive intelligent AI-driven recommendations to enhance quality and efficiency.

## Project Architecture

### Core Technologies
- **Frontend**: React 18 with TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js 18, Express.js, TypeScript
- **Database**: PostgreSQL 13+ with Drizzle ORM
- **AI Integration**: OpenAI GPT-4o and Anthropic Claude-3-7-Sonnet
- **Authentication**: Express-session with Passport.js

### Key Features
1. **ATMF Maturity Assessment System**: 6 dimensions, 5 levels each with AI-powered recommendations
2. **Test Management**: Complete test suite/case/cycle/execution tracking
3. **AI Integration**: Dual-provider strategy (OpenAI for general features, Claude for document generation)
4. **Multi-Project Support**: Data isolation with role-based access control
5. **Integration Platform**: Jira and GitHub connectivity with health monitoring
6. **Analytics & Reporting**: Real-time dashboards and automated report generation
7. **Documenter AI**: Generates PRD, SRS, SDDS, Test Plans, and Reports

### Database Design
- Multi-tenant architecture with project-level data isolation
- JSONB fields for flexible data structures (test steps, evidence, configurations)
- Comprehensive foreign key relationships ensuring data integrity
- Optimized indexes for performance at scale

### AI Architecture
- **OpenAI GPT-4o**: Used for general AI features, insights, whisper suggestions, and assistant chat
- **Anthropic Claude**: Specialized for document generation with better long-form content
- Context-aware prompting with project-specific data integration
- Robust error handling and fallback mechanisms

## Recent Changes

### 2025-07-16: Coverage Information Display System Implementation
- **Coverage Display Components**: Built comprehensive coverage visualization system
  - CoverageDisplay.tsx: Main component for detailed coverage information display with organized sections
  - CompactCoverageDisplay.tsx: Condensed coverage view for test suite cards
  - coverage-parser.ts: Utility for parsing structured coverage text format
- **Coverage Storage Format**: Standardized text format for test suite coverage tracking
  - Format: "JIRA_TICKETS: XAM-123, XAM-124 | COMPLIANCE: GDPR data processing | DOCUMENTS: User authentication section"
  - Database Field: test_suites.coverage (text field for flexible storage)
- **Visual Enhancement**: Added organized sections with colored badges and icons for each coverage type
- **TypeScript Integration**: Updated all interfaces across codebase to include coverage field support
- **Test Management Integration**: Seamlessly integrated coverage display into test suite details view

### 2025-07-16: Comprehensive Codebase Refactoring and Modularization
- **Frontend Component Refactoring**: Broke down massive test-management.tsx (2,621 lines) into 15 focused components
  - AITestCoverageDialog: Handles test coverage analysis and proposals display
  - AITestSuiteDialog: Manages AI test suite generation input
  - AITestSuiteProposalsDialog: Shows and handles AI-generated test suite proposals
  - TestSuiteHeader: Consolidated search, filters, and action buttons
  - TestSuiteCard: Individual test suite display with actions
  - TestSuiteGrid: Grid layout for test suite cards
  - CreateTestSuiteDialog: Form for creating new test suites
  - CreateTestCaseDialog: Form for creating new test cases
  - TestCaseDetailsDialog: Detailed view of test case information

- **Backend Routes Refactoring**: Modularized massive routes.ts (2,602 lines) into feature-based route modules
  - auth.routes.ts: Authentication and authorization endpoints
  - settings.routes.ts: Global settings management
  - projects.routes.ts: Project CRUD operations
  - test-management.routes.ts: Test suites, cases, and AI test generation
  - ai.routes.ts: All AI-powered features and analysis endpoints
  - jira.routes.ts: Jira integration and ticket management
  - maturity.routes.ts: ATMF framework and assessment endpoints
  - documents.routes.ts: Document management and analytics
  - index.ts: Central route registration and health checks

- **Architecture Benefits**: 
  - Single responsibility principle for all components and route modules
  - Clear separation of concerns between UI, business logic, and data access
  - Enhanced maintainability with smaller, focused files (50-400 lines each)
  - Improved reusability across the application
  - Better testability with isolated components and endpoints

### 2025-07-16: Enhanced AI Loading Animations and Jira Link Fix  
- Implemented playful loading animations for all AI test generation features
- Added floating icons, pulsing dots, progress rings, and staged progress messages
- Enhanced AI Test Coverage, Test Case Generation, and Test Suite Generation with interactive loading states
- Fixed critical Jira link creation bug by ensuring proper operation order: test cases created first, then Jira links
- Added "NEW" badge indicators for non-existent Jira tickets in AI coverage proposals
- Improved error handling to gracefully skip links for missing tickets while maintaining database integrity
- Updated database interface to properly handle ticket existence checking with projectId parameter

### 2025-07-16: Jira Integration and Ticket Management System
- Implemented comprehensive Jira ticket storage and synchronization system
- Added three new database tables: jira_tickets, jira_sync_logs, test_case_jira_links
- Created JiraService with smart caching, change detection, and incremental sync capabilities
- Built Jira Tickets page with real-time sync status, filtering, and ticket management
- Added sync status indicators (synced, pending, error, stale) with visual feedback
- Implemented API endpoints for ticket fetching, syncing, and connection testing
- Added Jira Tickets menu item to sidebar navigation with bug icon
- Enhanced error handling with retry mechanisms and comprehensive logging
- Supports full, incremental, and manual sync modes with background processing

### 2025-07-16: Test Strategy Field Implementation
- Added testStrategy field to projects database schema
- Implemented Test Strategy tab in project settings with rich text editor
- Updated AI generation functions to include testStrategy context in prompts
- Set default analytical risk-based testing strategy for all projects
- Enhanced generateTestCases function to use project testing strategy
- Updated document generation (PRD, SRS, SDDS, Test Plan) to include testing strategy context
- All AI-powered features now consider project-specific testing strategy when generating recommendations

### 2025-01-15: Comprehensive Documentation Creation
- Created complete database schema documentation with restoration guide
- Developed detailed Product Requirements Document (PRD) with market analysis and success metrics
- Built comprehensive Software Requirements Specification (SRS) with technical architecture
- Added detailed feature designs for:
  - ATMF Maturity Assessment System with AI recommendation engine
  - Test Management System with execution tracking and Jira integration
  - AI Integration System with dual-provider strategy and context analysis
  - Multi-Project Management with data isolation and health monitoring
  - Integration Platform for Jira/GitHub connectivity
  - Analytics & Reporting Engine with predictive analytics
- Structured documentation in database with proper categorization
- Enhanced database schema dump for complete system restoration

### Previous Implementation
- Implemented AI Configuration access through top menu gear icon (admin-only)
- Added GPT-4.1 model option to OpenAI settings dropdown
- Integrated Anthropic Claude for Documenter AI document generation
- Enhanced error handling for database connection issues in AI service functions
- Created comprehensive documentation structure in database with folders

## User Preferences
- Focus on technical accuracy and comprehensive implementation
- Prefer detailed documentation with code examples and architecture diagrams
- Value system reliability and error handling
- Appreciate thorough testing and validation approaches

## Development Guidelines
- Maintain TypeScript strict mode for type safety
- Use Drizzle ORM for all database operations
- Implement proper error boundaries and fallback mechanisms
- Follow multi-tenant data isolation patterns
- Ensure all AI features have proper rate limiting and error handling
- Document all major architectural decisions

## Deployment Notes
- Database schema is fully documented in `database_schema_dump.sql`
- All AI configurations stored in global_settings table
- Environment variables required: DATABASE_URL, OPENAI_API_KEY, ANTHROPIC_API_KEY
- Session storage configured for authentication persistence

## Next Steps
- Complete implementation of any remaining features from the detailed designs
- Implement automated testing for all critical paths
- Set up monitoring and alerting for production deployment
- Create user training materials and documentation