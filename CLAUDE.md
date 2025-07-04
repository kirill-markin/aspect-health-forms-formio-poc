# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Environment Setup
```bash
# Complete one-command setup (recommended for new environments)
./scripts/setup.sh

# Start development environment only
./scripts/dev-up.sh

# Validate entire setup
./scripts/validate.sh
```

### Docker Services Management
```bash
# Start all services
docker-compose up -d

# View logs (all services)
docker-compose logs -f

# View specific service logs
docker-compose logs -f formio-server
docker-compose logs -f mongodb

# Restart services
docker-compose restart

# Stop and remove all data (clean slate)
docker-compose down -v
```

### React Native App Development
```bash
# Navigate to app directory first
cd app

# Start development server
npm start

# Platform-specific starts
npm run web     # Browser (easiest for testing)
npm run ios     # iOS simulator
npm run android # Android emulator

# Code quality
npm run lint       # ESLint check
npm run format     # Prettier formatting
npm run type-check # TypeScript validation
```

### Form.io API Testing
```bash
# Health check
curl http://localhost:3002/health

# List all forms
curl http://localhost:3002/form

# Create a test submission
curl -X POST http://localhost:3002/form/{form-id}/submission \
  -H "Content-Type: application/json" \
  -d '{"data":{"name":"test","email":"test@example.com"}}'
```

## Architecture Overview

### System Architecture
This is a healthcare forms management POC using Form.io as a headless CMS with React Native frontend. The system consists of three main layers:

1. **Form.io Backend**: Visual form builder + REST API + MongoDB storage
2. **React Native App**: Mobile-first form completion interface
3. **Integration Layer**: TypeScript API client bridging Form.io and React Native

### Key Architectural Decisions

**Form Rendering Strategy**: Uses WebView with Form.io's JavaScript SDK rather than native components. This provides full compatibility with Form.io's conditional logic, validation, and field types but requires WebView bridge communication.

**API Client Pattern**: Singleton FormioClient class (`src/api/formio.ts`) handles all Form.io API interactions with automatic token management, error formatting, and request/response interceptors.

**Type System**: Comprehensive TypeScript definitions (`src/types/formio.ts`) model Form.io's complex form structure including components, conditional logic, submissions, and validation rules.

### Component Architecture

**FormRenderer** (`src/components/FormRenderer.tsx`):
- Generates complete HTML document embedding Form.io's JavaScript SDK
- Handles WebView ↔ React Native communication via postMessage
- Manages form lifecycle: loading → rendering → submission → error handling
- Provides public methods for programmatic form control (submit, setData, validate)

**Screen Architecture**:
- **HomeScreen**: Form list, creation, and management interface
- **FormScreen**: Individual form display with details panel and renderer integration

**Navigation**: React Navigation stack with parameterized routes passing FormioForm objects between screens.

### Environment Configuration

**Multi-environment setup**:
- Root `.env`: Docker/Form.io server configuration
- `app/.env`: React Native app configuration with EXPO_PUBLIC_ prefixed variables
- Default to localhost:3002 for Form.io server in development

### Docker Service Dependencies
- **formio-server** (port 3002): Main Form.io application and API
- **mongodb** (port 27017): Primary data storage
- **redis** (port 6379): Caching and session management
- **formio-pdf** (port 4001): Optional PDF generation service

### Critical Integration Points

**Form.io ↔ React Native Bridge**:
The FormRenderer component creates a WebView containing a complete HTML document that loads Form.io's JavaScript SDK. Communication happens through:
- React Native → WebView: postMessage with JSON commands (submit, setData, validate)
- WebView → React Native: window.ReactNativeWebView.postMessage with form events (submit, error, change, ready)

**Authentication Flow**: FormioClient supports JWT token authentication with automatic header injection and 401 response handling for token expiration.

**Error Handling Strategy**: Standardized FormioError interface with structured error details for both API errors and form validation errors.

### Development vs Production Considerations

**Security**: Default credentials (admin@example.com/password123) and secrets are development-only. Production requires:
- Secure JWT_SECRET
- Protected admin credentials
- SSL/TLS configuration
- Proper CORS settings

**Performance**: WebView rendering may have performance implications on mobile devices. Consider native form rendering for production if performance becomes critical.

### Healthcare-Specific Features

The codebase is specifically designed for healthcare forms with:
- HIPAA-compliance considerations in form design
- Medical questionnaire templates in `infra/sample-forms/`
- Conditional logic for health assessments
- Consent management components
- NPS and satisfaction survey patterns

### Form.io Integration Specifics

**Conditional Logic**: Form.io's built-in conditional system is preserved through the WebView integration. Forms can use operators like `eq`, `neq`, `in`, `not_in`, `gt`, `lt` without custom JavaScript.

**Form Versioning**: Form.io's native versioning system allows safe form updates without breaking existing submissions.

**Field Types**: Full support for Form.io's field types including surveys, ratings, file uploads, and signature fields through the WebView integration.

### Troubleshooting Architecture

**Service Health**: The validate script checks Docker services, API health, MongoDB connectivity, and React Native app configuration in sequence.

**Common Failure Points**:
- WebView communication failures: Check browser console in WebView for JavaScript errors
- Form.io API connectivity: Verify docker-compose services and network configuration
- MongoDB connection: Check authentication and network connectivity between containers
- React Native build issues: Clear Metro cache and reinstall dependencies