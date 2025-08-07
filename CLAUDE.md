# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Management
- `yarn install` - Install dependencies
- `yarn` - Install dependencies (shorthand)

### Development Server
- `yarn start:dev` - Start development server with hot reload
- `yarn start` - Start server in production mode
- `yarn start:debug` - Start server with debugging enabled

### Build and Production
- `yarn build` - Build the application using NestJS CLI
- `yarn start:prod` - Start the built application

### Code Quality
- `yarn lint` - Run ESLint with auto-fix on TypeScript files
- `yarn format` - Format code using Prettier

### Testing
- `yarn test` - Run unit tests with Jest
- `yarn test:watch` - Run tests in watch mode
- `yarn test:cov` - Run tests with coverage report
- `yarn test:e2e` - Run end-to-end tests
- `yarn test:debug` - Run tests in debug mode

### Database
- Database operations use Prisma ORM
- Schema is defined in `prisma/schema.prisma`
- Uses PostgreSQL as the database

### Docker Development
- `docker-compose up` - Start all services (NestJS app, PostgreSQL, NATS)
- Services run on:
  - NestJS app: http://localhost:3000
  - PostgreSQL: localhost:5432
  - NATS: localhost:4222

## Architecture Overview

This system is **transitioning from an Online Judge to a CMS platform**. The current codebase uses legacy naming conventions that will be migrated to modern CMS terminology.

### Core Technology Stack
- **Framework**: NestJS with Fastify adapter for performance
- **Database**: PostgreSQL with Prisma ORM
- **Message Queue**: **NATS with JetStream** for exactly-once delivery
- **Authentication**: JWT-based auth with refresh tokens stored in database
- **API Documentation**: Swagger/OpenAPI at `/api`

### Database Schema Evolution
**Current (Legacy) → Planned (CMS)**:
- `course` → **`workspace`** (content management workspace)
- `problem_set` → **`content`** (general content items)
- `solution_history` → **`activity_log`** (user interactions)
- `course_owner` → **`workspace_members`** (workspace access control)
- `whitelist_entries` → **`content_permissions`** (content-level permissions)

Current schema includes Online Judge-specific models that store execution results, test cases, and programming submissions, but these will be generalized for CMS use with the new terminology.

### Application Structure
```
src/
├── auth/                 # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts   # JWT handling, login/register logic
│   ├── auth.repository.ts# Database operations for auth
│   ├── auth.guard.ts     # JWT verification middleware
│   └── auth.dto.ts       # Data transfer objects
├── role/                 # Role-based access control decorators
└── app.module.ts         # Global module with PrismaService
```

### Key Features
- **Role-based Access**: Student, Professor, Admin permissions via `permission_t_t` enum
- **Workspace Management**: Time-bound content access with ownership control
- **Secure Authentication**: JWT tokens persisted in database for revocation capability
- **Multi-tenancy**: Workspace-based content isolation with member management
- **Message Processing**: Exactly-once delivery with NATS JetStream (replacing Kafka)

### Development Notes
- Uses Fastify instead of Express for better performance
- Global PrismaService exported from AppModule for database connections
- JWT tokens stored in `login` table with expiration tracking
- Error messages are in Korean
- Uses bcryptjs for password hashing
- **NATS JetStream** configured for exactly-once delivery semantics
- **CMS Migration**: System transitioning from Online Judge to workspace-based CMS
- Swagger documentation configured for "Vision Lab. Hoseo online judge" (needs updating for CMS)
- Environment variables: `JWT_SECRET`, `DATABASE_URL`, PostgreSQL credentials (`PG_USER`, `PG_PW`, `PG_DB`)