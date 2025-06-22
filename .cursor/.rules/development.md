# Development Rules for AI Translation Project

## 🎯 Project Overview
This is a production-ready AI text translation application built with:
- **Backend**: NestJS + TypeScript + PostgreSQL
- **Frontend**: React + TypeScript + Vite
- **Infrastructure**: Docker + Docker Compose
- **AI**: OpenAI GPT-4 / Groq API
- **Testing**: Jest + Vitest + Testing Library

## 📋 Code Standards

### TypeScript
- Always use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use explicit return types for functions
- Leverage generics for reusable components
- Use `as const` for readonly arrays and objects

### Backend (NestJS)
- Follow NestJS module structure (controller, service, entity, dto)
- Use decorators properly (@Injectable, @Controller, @Entity, etc.)
- Implement proper error handling with custom exceptions
- Use class-validator for DTO validation
- Follow RESTful API conventions
- Implement proper logging with Winston or similar

### Frontend (React)
- Use functional components with hooks
- Implement custom hooks for reusable logic
- Use React Query/SWR for server state management
- Implement proper error boundaries
- Use compound component patterns when appropriate
- Prefer composition over inheritance

### Testing (TDD Approach)
- Write tests BEFORE implementation
- Follow AAA pattern (Arrange, Act, Assert)
- Use descriptive test names
- Mock external dependencies
- Test edge cases and error scenarios
- Maintain high test coverage (>80%)

## 🏗️ Architecture Patterns

### Backend Patterns
- **Repository Pattern**: For data access layer
- **Service Layer Pattern**: For business logic
- **DTO Pattern**: For data transfer between layers
- **Middleware Pattern**: For cross-cutting concerns
- **Guard Pattern**: For authentication and authorization

### Frontend Patterns
- **Container/Presentational Pattern**: Separate logic from UI
- **Custom Hooks Pattern**: Extract reusable logic
- **Compound Components Pattern**: For complex UI components
- **Provider Pattern**: For global state management
- **Higher-Order Components**: For component enhancement

## 🔒 Security Rules

### Backend Security
- Always validate input data using DTOs
- Use bcrypt for password hashing
- Implement JWT with proper expiration
- Add rate limiting to prevent abuse
- Sanitize user inputs to prevent XSS
- Use parameterized queries to prevent SQL injection
- Implement proper CORS configuration

### Frontend Security
- Validate all user inputs
- Sanitize data before displaying
- Use HTTPS for all API calls
- Store sensitive data securely (no localStorage for tokens)
- Implement proper authentication state management

## 🚀 Performance Rules

### Backend Performance
- Use database indexing strategically
- Implement connection pooling
- Use async/await properly
- Cache frequent queries
- Implement pagination for large datasets
- Use compression for API responses

### Frontend Performance
- Implement code splitting and lazy loading
- Use React.memo for expensive components
- Debounce user inputs
- Optimize bundle size
- Use proper image optimization
- Implement virtualization for large lists

## 📁 File Organization

### Backend Structure
```
src/
├── auth/           # Authentication module
├── users/          # User management
├── translations/   # Translation logic
├── ai/            # AI service integration
├── database/      # Database configuration
├── common/        # Shared utilities
└── main.ts        # Application entry point
```

### Frontend Structure
```
src/
├── components/    # Reusable UI components
├── pages/         # Page components
├── services/      # API service layer
├── hooks/         # Custom React hooks
├── context/       # React contexts
├── utils/         # Utility functions
└── types/         # TypeScript type definitions
```

## 🧪 Testing Guidelines

### Backend Tests
- Unit tests for services and utilities
- Integration tests for controllers
- E2E tests for critical user flows
- Database tests with test containers
- Mock external services (AI APIs)

### Frontend Tests
- Component tests with React Testing Library
- Hook tests with renderHook
- Integration tests for user flows
- Mock API calls with MSW
- Snapshot tests for complex components

## 🐳 Docker Rules

### Dockerfile Best Practices
- Use multi-stage builds
- Minimize layer count
- Use specific version tags
- Add health checks
- Run as non-root user
- Use .dockerignore appropriately

### Docker Compose
- Use environment variables
- Implement proper networking
- Add volume mounts for development
- Include health checks
- Set resource limits

## 📊 Database Rules

### PostgreSQL Best Practices
- Use UUIDs for primary keys
- Implement proper indexing
- Use foreign key constraints
- Add created_at/updated_at timestamps
- Use transactions for related operations
- Implement database migrations properly

### TypeORM Configuration
- Use entities with decorators
- Implement proper relationships
- Use query builders for complex queries
- Add database seeders for development
- Use migrations for schema changes

## 🔄 Git Workflow

### Commit Messages
- Use conventional commits format
- Write descriptive commit messages
- Reference issues when applicable
- Keep commits atomic and focused

### Branch Strategy
- Use feature branches for development
- Implement proper code review process
- Merge only tested and reviewed code
- Keep main branch always deployable

## 🎨 UI/UX Guidelines

### Design System
- Use consistent color palette
- Implement proper spacing system
- Follow accessibility guidelines (WCAG)
- Use semantic HTML elements
- Implement responsive design
- Add loading and error states

### User Experience
- Provide immediate feedback for actions
- Implement proper form validation
- Add confirmation for destructive actions
- Use optimistic updates where appropriate
- Implement proper error handling

## 📈 Monitoring & Logging

### Backend Monitoring
- Log all errors with context
- Monitor API response times
- Track user activity
- Monitor database performance
- Implement health checks

### Frontend Monitoring
- Track user interactions
- Monitor bundle size
- Log JavaScript errors
- Track performance metrics
- Monitor API call failures

## 🔧 Development Workflow

### Before Starting Development
1. Read the DEVELOPMENT_PLAN.md
2. Set up development environment
3. Run all tests to ensure clean state
4. Create feature branch

### During Development
1. Write tests first (TDD)
2. Implement minimal code to pass tests
3. Refactor and optimize
4. Update documentation if needed
5. Run full test suite before commit

### Before Pushing Code
1. Run linting and formatting
2. Execute all tests
3. Check TypeScript compilation
4. Verify Docker builds work
5. Update DEVELOPMENT_PLAN.md if needed

## 🚨 Never Do This

- Don't commit sensitive data (API keys, passwords)
- Don't skip input validation
- Don't ignore TypeScript errors
- Don't commit broken tests
- Don't use `any` type unless absolutely necessary
- Don't hardcode configuration values
- Don't ignore security best practices
- Don't skip error handling
- Don't commit without testing
- Don't use deprecated dependencies

## ✅ Always Do This

- Write descriptive variable and function names
- Add comments for complex business logic
- Handle errors gracefully
- Validate all inputs
- Use TypeScript strictly
- Write tests for new features
- Update documentation
- Follow consistent code formatting
- Use semantic versioning for releases
- Implement proper logging

---

**Remember**: Quality over speed. We're building production-ready software that will be evaluated on architecture, scalability, security, and code quality. 