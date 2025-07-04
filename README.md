# Aspect Health Forms - Form.io POC

A proof-of-concept demonstrating dynamic form management using Form.io's open-source components as a headless CMS backend with React Native frontend integration.

## Overview

This POC showcases:
- **Dynamic Form Creation**: Create forms through Form.io admin interface
- **Conditional Logic**: Advanced branching rules for question flow
- **React Native Integration**: Mobile-first form completion experience
- **Healthcare Forms**: Specialized forms for medical questionnaires and surveys
- **Data Management**: Structured response storage and analytics

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │     Form.io     │    │     MongoDB     │
│   Mobile App    │◄──►│   Server + UI   │◄──►│    Database     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Quick Start

### Prerequisites

#### System Requirements
- **Docker & Docker Compose** - for running Form.io server and MongoDB
- **Node.js 18+** - for React Native development
- **npm or yarn** - package manager

### 🚀 One-Command Setup (Recommended)

**The easiest way to get started:**

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd aspect-health-forms-formio-poc

# Complete setup with one command
./scripts/setup.sh
```

**This single command will:**
- ✅ Start Docker containers (Form.io server + MongoDB + Redis)
- ✅ Set up React Native environment and install dependencies
- ✅ **Create demo health survey forms automatically**
- ✅ Validate the complete setup
- ✅ Provide ready-to-test environment with sample data

**Expected Output:**
- 🎉 Complete working demo in ~3-4 minutes
- 📋 Pre-populated demo forms ready for testing
- 🔗 Direct access URLs and testing instructions

**📋 See [QUICK_START.md](QUICK_START.md) for 5-minute testing guide with demo data!**

### 📱 Start Using the Demo

After running `./scripts/setup.sh`, you can immediately:

1. **Access Form.io Admin**: http://localhost:3002
   - Login: `admin@example.com` / `password123`
   - **Demo forms are pre-created**: "Comprehensive Health Survey"
   - Edit forms using the built-in visual form builder

2. **Import Additional Forms** (if needed):
   ```bash
   npm run import-forms
   # Imports all forms from /infra/sample-forms/
   ```

3. **Start React Native App**:
   ```bash
   cd app
   npm start
   # Press 'w' for web browser (easiest for testing)
   # Press 'i' for iOS simulator  
   # Press 'a' for Android emulator
   ```

4. **Test the Complete Flow**:
   - Open the mobile app → demo forms appear automatically
   - Tap "Comprehensive Health Survey" to test conditional logic
   - Complete and submit the form
   - Check saved responses in Form.io Admin → Forms → Data tab

**🎯 Complete testing guide: [QUICK_START.md](QUICK_START.md)**

### 🔧 Manual Setup (Alternative)

If you prefer step-by-step control:

#### Step 1: Start Development Environment

```bash
# Start Form.io + MongoDB + Redis containers
./scripts/dev-up.sh
```

#### Step 2: Set Up React Native App

```bash
cd app
npm install
npm start
```

### ✅ Validate Your Setup

Check if everything is working correctly:

```bash
# Run comprehensive validation
./scripts/validate.sh
```

This will verify:
- Docker containers are running
- Form.io server is responding
- MongoDB connection is working
- React Native environment is configured
- All API endpoints are working

### 🧪 Testing the Complete Flow

1. **Form.io Admin Test:**
   - Navigate to http://localhost:3001
   - Login and explore the form builder
   - Create a new form or modify existing ones

2. **React Native App Test:**
   - Open the mobile app
   - Create and complete a health survey
   - Verify conditional logic works (different questions based on answers)

3. **Data Flow Test:**
   - Submit a form response in the mobile app
   - Check the Form.io admin for saved submissions
   - Verify the response data was saved correctly

## ✅ Setup Validation Checklist

Use this checklist to verify your local setup is working correctly:

### Form.io Backend ✓
- [ ] Docker containers running: `docker-compose ps`
- [ ] Form.io admin accessible: http://localhost:3001
- [ ] Can login with admin@example.com / password123
- [ ] Form builder interface loads correctly
- [ ] Can create new forms using the GUI

### React Native App ✓  
- [ ] App dependencies installed: `npm install` in app/ directory
- [ ] Environment configured: `app/.env` exists with Form.io URL
- [ ] Development server starts: `npm start` in app/ directory
- [ ] App loads without errors (web/simulator/device)
- [ ] Home screen shows "Aspect Health Forms"
- [ ] Can create sample forms using the button

### End-to-End Flow ✓
- [ ] Can create forms in Form.io admin interface
- [ ] Forms appear in React Native app
- [ ] Can complete forms with proper field validation
- [ ] Conditional logic works (different questions based on answers)
- [ ] Form submission shows success screen
- [ ] Response saved in Form.io admin (check submissions)

### API Integration ✓
- [ ] API health check works: `curl http://localhost:3001/health`
- [ ] Forms endpoint accessible: `curl http://localhost:3001/form`
- [ ] Mobile app can fetch form data (check browser console/logs)
- [ ] Mobile app can submit responses (verify in Form.io admin)

**If all checkboxes are ✅, your POC is ready for demonstration!**

## Project Structure

```
aspect-health-forms-formio-poc/
├── README.md
├── .gitignore                  # Git ignore rules for security
├── .env.example                # Environment template
├── .env                        # Environment configuration (not in git)
├── package.json                # Root package.json with scripts
├── docker-compose.yml          # Form.io + MongoDB + Redis setup
│
├── infra/                      # Infrastructure as Code
│   ├── sample-forms/
│   │   └── health-survey.json      # Sample form definitions
│   └── scripts/                    # Deployment scripts
│
├── app/                        # React Native Application
│   ├── package.json
│   ├── app.json
│   ├── App.tsx                     # Main app component
│   ├── .env.example                # App environment template
│   ├── .env                        # App environment config (not in git)
│   └── src/
│       ├── api/
│       │   └── formio.ts           # Form.io API client
│       ├── components/
│       │   └── FormRenderer.tsx    # Dynamic form renderer
│       ├── screens/
│       │   ├── HomeScreen.tsx      # Form list and management
│       │   └── FormScreen.tsx      # Individual form display
│       └── types/
│           └── formio.ts           # TypeScript definitions
│
├── scripts/
│   ├── setup.sh                # Complete one-command setup
│   ├── dev-up.sh               # Start development environment
│   ├── import-forms.js         # Import forms from JSON files
│   └── validate.sh             # Validate complete setup
│
└── tmp/00_init/
    └── 00_project_overview.md  # Project documentation
```

## Core Features

### Dynamic Form Management
- Create forms through Form.io's visual form builder
- Support for multiple question types (text, radio, checkboxes, surveys, etc.)
- Real-time form updates without app deployment
- Form versioning and management

### Conditional Logic
- Advanced branching rules with multiple operators
- Show/hide fields based on user responses
- Complex conditional expressions
- Support for nested conditions

### React Native Integration
- Native mobile form rendering using WebView
- Form.io JavaScript SDK integration
- Offline-capable form completion
- Native UI components for optimal mobile experience

### Data Collection
- Structured response storage in MongoDB
- Real-time submission tracking
- Export capabilities for analytics
- Response validation and error handling

### Healthcare-Specific Features
- HIPAA-compliant form designs
- Medical questionnaire templates
- Patient intake forms
- Health survey components
- Consent management

## Form.io vs Directus Comparison

### Form.io Advantages
- **Purpose-built for forms**: Native form builder and conditional logic
- **Rich field types**: Out-of-the-box support for surveys, ratings, file uploads
- **Visual form builder**: Drag-and-drop interface for non-technical users
- **Form versioning**: Built-in support for form evolution and A/B testing
- **Conditional logic**: Advanced branching without custom development

### Directus Advantages
- **Database-agnostic**: Works with existing SQL databases
- **Data-first approach**: Direct database schema management
- **Custom collections**: Flexible content types beyond forms
- **Admin interface**: Rich content management capabilities
- **GraphQL support**: Modern API standards

### Use Case Recommendations

**Choose Form.io when:**
- Primary use case is forms and surveys
- Need advanced conditional logic out of the box
- Want visual form building for non-technical users
- Require form versioning and A/B testing
- Focus on rapid form deployment

**Choose Directus when:**
- Need to work with existing database schemas
- Require complex content management beyond forms
- Want database-first approach with flexible APIs
- Need custom business logic and workflows
- Prefer SQL-based data management

## Demo Forms

The POC includes sample healthcare forms:

### Health Survey Demo
- Personal information collection
- Health assessment with conditional logic
- Medical history questionnaire
- Lifestyle factors evaluation
- Healthcare satisfaction survey
- Consent management

### Features Demonstrated
- **Conditional Logic**: Different questions appear based on health rating
- **Multiple Field Types**: Text, email, radio, checkboxes, surveys, ratings
- **Validation**: Required fields, format validation, range validation
- **User Experience**: Mobile-optimized form rendering
- **Data Flow**: Form submission to MongoDB storage

## Import Sample Forms

### Automated Form Import Script

The project includes an automated script to import form definitions from JSON files:

```bash
# Import all forms from /infra/sample-forms/
npm run import-forms

# Or run directly
node scripts/import-forms.js
```

### What the Script Does
1. **Authenticates** with Form.io using admin credentials
2. **Scans** `/infra/sample-forms/` directory for `.json` files
3. **Validates** JSON structure before import
4. **Checks** for existing forms to avoid duplicates
5. **Imports** forms via Form.io REST API
6. **Provides** detailed feedback and success/error reporting

### Script Features
- ✅ **Automatic Authentication** - Handles admin login
- ✅ **Duplicate Prevention** - Skips existing forms
- ✅ **Error Handling** - Detailed error reporting
- ✅ **Batch Import** - Processes multiple forms at once
- ✅ **Validation** - Checks JSON structure before import
- ✅ **Colored Output** - Easy-to-read progress indicators

### Adding New Forms
1. Create form JSON file in `/infra/sample-forms/`
2. Ensure proper Form.io JSON structure with required fields:
   ```json
   {
     "title": "Form Title",
     "name": "formName", 
     "path": "form-path",
     "type": "form",
     "components": [...]
   }
   ```
3. Run `npm run import-forms` to import

### Example Output
```
🚀 Starting Form.io form import process...
🔍 Checking Form.io server connection...
✅ Form.io server is accessible
🔐 Authenticating with Form.io admin account...
✅ Successfully authenticated as admin
📁 Found 1 form file(s) to import
📖 Loading form from: health-survey.json
📋 Loaded form: Comprehensive Health Survey
📤 Importing form: Comprehensive Health Survey
✅ Successfully imported form: Comprehensive Health Survey
   📍 Form ID: 68679d861da90e206ef42dfa
   🔗 Form URL: http://localhost:3002/comprehensive-health-survey

📊 Import Summary:
✅ Successfully imported: 1 forms

🎉 Forms are now available in Form.io!
📱 Access admin panel: http://localhost:3002
👤 Login: admin@example.com / password123
```

## API Endpoints

### Form.io REST API
- `GET /form` - List all forms
- `GET /form/{id}` - Get specific form
- `POST /form` - Create new form
- `PUT /form/{id}` - Update form
- `DELETE /form/{id}` - Delete form
- `GET /form/{id}/submission` - Get form submissions
- `POST /form/{id}/submission` - Create submission

### Example Usage

```typescript
// Get all forms
const forms = await formioClient.getForms();

// Get specific form
const form = await formioClient.getForm('form-id');

// Create submission
const submission = await formioClient.createSubmission('form-id', {
  name: 'John Doe',
  email: 'john@example.com',
  healthRating: 'good'
});

// Get submissions
const submissions = await formioClient.getSubmissions('form-id');
```

## Development Commands

```bash
# Complete setup (recommended)
./scripts/setup.sh

# Start development environment only  
./scripts/dev-up.sh

# Import sample forms from JSON files
npm run import-forms
# or directly: node scripts/import-forms.js

# Create demo forms manually
./scripts/seed-demo-data.sh

# Validate setup
./scripts/validate.sh

# View logs
docker-compose logs -f

# Stop environment
docker-compose down

# Restart services
docker-compose restart

# Clean slate (removes all data)
docker-compose down -v
```

## Local Development Workflow

### Daily Development
```bash
# Start services (if not running)
./scripts/dev-up.sh

# Start React Native development server
cd app && npm start

# Open in browser
# Press 'w' for web, 'i' for iOS, 'a' for Android
```

### Form Development Workflow
1. **Create/Edit Forms**: Use Form.io Admin UI at http://localhost:3001
2. **Test in Mobile**: Forms appear automatically in React Native app
3. **Debug**: Check browser console in WebView for JavaScript errors
4. **Data Validation**: View submissions in Form.io Admin → Forms → Data

### API Development
```bash
# Test Form.io API health
curl http://localhost:3001/health

# List all forms
curl http://localhost:3001/form

# Get specific form
curl http://localhost:3001/form/{form-id}

# Create test submission
curl -X POST http://localhost:3001/form/{form-id}/submission \
  -H "Content-Type: application/json" \
  -d '{"data":{"name":"Test User","email":"test@example.com"}}'
```

### React Native Development
```bash
cd app

# Install dependencies
npm install

# Start development server
npm start

# Code quality checks
npm run lint       # ESLint
npm run format     # Prettier
npm run type-check # TypeScript
```

## Configuration

### Environment Variables
- `FORMIO_URL` - Form.io server endpoint
- `MONGO_CONNECTION_STRING` - MongoDB connection
- `JWT_SECRET` - JWT token secret
- `ADMIN_EMAIL` / `ADMIN_PASS` - Admin credentials

### Docker Services
- **Form.io Server**: Port 3001 (admin interface + API)
- **MongoDB**: Port 27017 (database)
- **Redis**: Port 6379 (caching)
- **PDF Server**: Port 4001 (optional, for PDF generation)

## Form Structure

### Form Components
- **Text Fields**: Single line, multi-line, email, phone
- **Selection**: Radio buttons, checkboxes, dropdowns
- **Advanced**: Surveys, ratings, file uploads, signatures
- **Layout**: Panels, columns, tabs for organization
- **Logic**: Conditional show/hide, validation rules

### Conditional Logic
Supports operators: `eq`, `neq`, `in`, `not_in`, `gt`, `lt`, `gte`, `lte`, `between`, `is_empty`, `is_not_empty`

Example:
```json
{
  "conditional": {
    "show": true,
    "when": "healthRating",
    "eq": "poor"
  }
}
```

## Troubleshooting

### Common Issues and Solutions

#### 🐳 Docker & Form.io Issues

**1. Form.io not starting**
```bash
# Check container logs
docker-compose logs formio-server

# Common fixes:
docker-compose down
docker-compose up -d

# If still failing, reset everything:
docker-compose down -v
docker-compose up -d
```

**2. Port conflicts (3001 already in use)**
```bash
# Check what's using the port
lsof -i :3001

# Kill the process or change port in docker-compose.yml
```

**3. MongoDB connection issues**
```bash
# Verify MongoDB is running
docker-compose ps

# Check database logs
docker-compose logs mongodb

# Reset database if corrupted
docker-compose down -v
docker-compose up -d
```

#### 📱 React Native Issues

**4. Metro bundler issues**
```bash
cd app

# Clear all caches
npx expo start --clear

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**5. App can't connect to Form.io**
```bash
# Check the app environment file
cat app/.env
# Should contain: EXPO_PUBLIC_FORMIO_URL=http://localhost:3001

# Test Form.io API manually
curl http://localhost:3001/health

# For iOS Simulator, use computer's IP instead of localhost:
EXPO_PUBLIC_FORMIO_URL=http://192.168.1.XXX:3001
```

#### 🔍 Data Flow Issues

**6. Form responses not saving**
- Check browser console for API errors
- Verify Form.io server is running: `curl http://localhost:3001/health`
- Test API manually:
```bash
curl -X POST http://localhost:3001/form/{form-id}/submission \
  -H "Content-Type: application/json" \
  -d '{"data":{"name":"test","email":"test@example.com"}}'
```

**7. Forms not appearing in mobile app**
- Check Form.io admin: ensure forms are created and not marked as system forms
- Verify API endpoint: `curl http://localhost:3001/form`
- Check React Native app logs for API errors

### 🚨 Emergency Reset

If everything is broken and you want to start fresh:

```bash
# Nuclear option - deletes all data
docker-compose down -v

# Complete automated reinstall
./scripts/setup.sh
```

### 💡 Getting Help

1. **Check container logs**: `docker-compose logs <service-name>`
2. **Verify services running**: `docker-compose ps`
3. **Test Form.io API**: `curl http://localhost:3001/health`
4. **Check app logs**: Enable debugging in React Native/Expo
5. **Inspect network requests**: Use browser dev tools to see API calls

## Comparison with Directus POC

### Functionality Comparison

| Feature | Form.io POC | Directus POC |
|---------|-------------|--------------|
| **Form Builder** | ✅ Visual drag-and-drop | ⚠️ Manual schema definition |
| **Conditional Logic** | ✅ Built-in advanced logic | ⚠️ Custom implementation required |
| **Field Types** | ✅ Rich form-specific types | ⚠️ Generic data types |
| **Mobile Integration** | ✅ WebView + JS SDK | ✅ REST API integration |
| **Data Storage** | ✅ MongoDB (NoSQL) | ✅ PostgreSQL (SQL) |
| **Admin Interface** | ✅ Form management focus | ✅ General content management |
| **API** | ✅ REST | ✅ REST + GraphQL |
| **Open Source** | ✅ Yes | ✅ Yes |
| **Self-hosted** | ✅ Yes | ✅ Yes |
| **Learning Curve** | 🟡 Form-focused | 🟡 Database-focused |

### Performance Comparison

| Aspect | Form.io POC | Directus POC |
|--------|-------------|--------------|
| **Setup Time** | ~3-4 minutes | ~2-3 minutes |
| **Form Creation** | Visual builder (minutes) | Manual coding (hours) |
| **Conditional Logic** | Drag-and-drop rules | Custom JavaScript |
| **Mobile Rendering** | WebView (good) | Native components (excellent) |
| **Resource Usage** | Medium (MongoDB + Redis) | Medium (PostgreSQL) |

### Development Experience

**Form.io Pros:**
- Rapid form development with visual tools
- Advanced conditional logic out of the box
- Form-specific features (validation, surveys, ratings)
- Non-technical users can create forms
- Built-in form versioning

**Form.io Cons:**
- Less flexible for non-form data structures
- WebView dependency for mobile rendering
- MongoDB may be overkill for simple use cases
- Form.io learning curve for customization

**Directus Pros:**
- Works with existing database schemas
- More flexible for complex data relationships
- Native mobile rendering possible
- SQL-based, familiar to many developers
- GraphQL support for modern apps

**Directus Cons:**
- Requires custom development for form logic
- No visual form builder
- More complex setup for form-specific features
- Conditional logic requires custom implementation

## Next Steps

### Production Deployment
- Use Docker Compose for production with proper secrets management
- Set up SSL certificates and reverse proxy
- Configure backup strategies for MongoDB
- Implement monitoring and logging
- Set up CI/CD pipelines

### Feature Enhancements
- **Advanced Form Types**: Multi-step wizards, file uploads with cloud storage
- **Integration**: Webhook support, third-party service connections
- **Analytics**: Response analytics dashboard, completion rate tracking
- **Security**: HIPAA compliance features, audit logging
- **Mobile**: Native mobile app (React Native CLI) for better performance
- **Offline**: Offline form completion with sync capabilities

### Healthcare-Specific Enhancements
- **FHIR Integration**: Health data standard compliance
- **Digital Signatures**: Legally binding form signatures
- **Secure Communication**: Encrypted data transmission
- **Patient Portal**: Self-service form access for patients
- **Provider Dashboard**: Healthcare provider form management interface

## License

This is a proof-of-concept project. Please refer to individual dependencies for their respective licenses.

---

## Quick Reference

**Form.io Admin**: http://localhost:3001 (admin@example.com / password123)  
**React Native**: `cd app && npm start`  
**Validation**: `./scripts/validate.sh`  
**Logs**: `docker-compose logs -f`  
**Reset**: `docker-compose down -v && ./scripts/setup.sh`