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

### 2025-07-17: Test Cycle CRUD Functionality Removal
- **Complete Test Cycle CRUD Removal**: Removed all test cycle creation, editing, and viewing functionality from the system
- **Simplified Test Execution Page**: Cleaned up test-execution.tsx by removing TestCycleModals, TestCycleForm, and related components
- **UI Streamlining**: Removed "New Test Cycle" button and all modal dialogs for cycle management
- **State Management Cleanup**: Removed unused state variables and handlers (newCycleDialogOpen, editCycleDialogOpen, handleCycleCreated, handleCycleUpdated)
- **Component Architecture**: Replaced complex refactored components with inline simplified display of existing cycles
- **Read-Only Cycle Display**: Test cycles are now displayed as read-only cards with only execution functionality
- **Enhanced Database Schema Preserved**: Database schema enhancements remain intact but UI functionality has been simplified
- **System Focus**: Application now focuses on test execution rather than cycle management

### 2025-07-17: AI Service Architecture Refactoring
- **Modular AI Service Architecture**: Refactored massive 2,458-line openai-service.ts into focused, maintainable modules
- **AI Client Manager**: Centralized OpenAI and Anthropic client management with configuration handling
- **Context Manager**: Intelligent project context aggregation and optimization for AI features
- **Test Generation Service**: Dedicated service for AI-powered test case, step, and coverage generation
- **Document Generation Service**: Specialized service for AI document creation using Anthropic Claude
- **Prompt Templates Engine**: Centralized prompt management with template system and optimization
- **Backward Compatibility**: Maintained compatibility layer for existing code while enabling new modular usage
- **Architecture Benefits**: Single responsibility principle, improved maintainability, better testability, and enhanced reusability

### 2025-07-16: Comprehensive Documentation Structure Creation
- **Complete Documentation Architecture**: Created comprehensive documentation structure with requirements, database, and functions folders
- **Product Requirements Document (PRD)**: Detailed market analysis, value proposition, feature requirements, and go-to-market strategy
- **Software Requirements Specification (SRS)**: Technical architecture, system features, API specifications, and performance requirements
- **Database Schema Documentation**: Complete schema with tables, indexes, views, security policies, and maintenance procedures
- **Functional Area Documentation**: Detailed documentation for User Management, Test Management, ATMF Assessment, and AI Integration
- **Cross-References and Dependencies**: Clear documentation of component relationships and system interactions
- **Maintenance Guidelines**: Documentation standards, review processes, and update procedures established

### 2025-07-16: Jira Tickets Page Enhancement with Intelligent Coverage System
- **Comprehensive Coverage Detection**: Enhanced logic to check both test cases and test suite coverage fields for complete coverage analysis
- **Smart Badge System**: Implemented three-color badge system replacing large boxes:
  - Green badge: Shows count of actual test cases covering the ticket
  - Yellow badge: Indicates ticket is planned (listed in test suite coverage field)
  - Red badge: No coverage exists (neither test cases nor suite planning)
- **Intelligent UI Logic**: AI Coverage button only appears for uncovered tickets (red badges)
- **Readable Descriptions**: Fixed raw JSON display by parsing Atlassian Document Format to readable text
- **Interactive Test Case Links**: Clickable test case links in coverage display for direct access to test details
- **System-Consistent Styling**: Dark blue AI Coverage button matching design system standards

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

### 2025-07-17: AI Readiness Assessment UI Enhancements and Dashboard Integration
- **UI Tab Reordering**: Changed AI Assessment tabs order to Summary → Assessments → Action Items for better user flow
- **Action Items Layout Redesign**: Completely redesigned action item cards with:
  - Moved priority/status badges to right side for better space utilization
  - Full text display without truncation using whitespace-pre-wrap
  - Enhanced typography with larger, bolder titles
  - Blue styling for completed items (bg-blue-50 with border-blue-200)
  - Improved spacing and visual hierarchy
- **Dashboard Restructuring**: Completely redesigned dashboard to focus on AI readiness:
  - Removed all ATMF dimension tabs, maturity levels, and recommendation sections
  - Added AI Readiness Summary section at top with overview cards
  - Integrated Action Items Progress and Recent Assessment Results
  - Maintained Metrics Overview section at bottom
  - Fixed API endpoint issues for proper data loading
- **Data Handling Improvements**: Enhanced error handling for assessment data structure variations
- **Comprehensive Recommendation Integration**: Enhanced AI assessment service to automatically convert key recommendations into actionable items with proper priority and impact scoring

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