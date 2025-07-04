#!/usr/bin/env node

/**
 * Form.io Form Import Script
 * 
 * This script imports form definitions from JSON files into a Form.io instance.
 * It reads form JSON files and creates them via the Form.io REST API.
 */

const fs = require('fs').promises;
const path = require('path');

// Configuration
const FORMIO_BASE_URL = process.env.FORMIO_URL || 'http://localhost:3002';
const FORMS_DIR = path.join(__dirname, '../infra/sample-forms');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';

// Global auth token
let authToken = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(url, options = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add auth token if available
    if (authToken) {
      headers['x-jwt-token'] = authToken;
    }

    const response = await fetch(url, {
      headers,
      ...options
    });

    // Check for auth token in response headers
    const responseToken = response.headers.get('x-jwt-token');
    if (responseToken) {
      authToken = responseToken;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Could not connect to Form.io server. Make sure it\'s running on ' + FORMIO_BASE_URL);
    }
    throw error;
  }
}

async function authenticateAdmin() {
  try {
    log('🔐 Authenticating with Form.io admin account...', 'cyan');
    
    const loginData = {
      data: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      }
    };

    await makeRequest(`${FORMIO_BASE_URL}/admin/login`, {
      method: 'POST',
      body: JSON.stringify(loginData)
    });

    if (authToken) {
      log('✅ Successfully authenticated as admin', 'green');
      return true;
    } else {
      throw new Error('No auth token received');
    }
  } catch (error) {
    log(`❌ Authentication failed: ${error.message}`, 'red');
    return false;
  }
}

async function checkFormioServer() {
  try {
    log('🔍 Checking Form.io server connection...', 'cyan');
    await makeRequest(`${FORMIO_BASE_URL}/form`);
    log('✅ Form.io server is accessible', 'green');
    return true;
  } catch (error) {
    log(`❌ Cannot connect to Form.io server: ${error.message}`, 'red');
    return false;
  }
}

async function getExistingForms() {
  try {
    log('📋 Fetching existing forms...', 'cyan');
    const forms = await makeRequest(`${FORMIO_BASE_URL}/form`);
    log(`📊 Found ${forms.length} existing forms`, 'blue');
    return forms;
  } catch (error) {
    log(`⚠️  Could not fetch existing forms: ${error.message}`, 'yellow');
    return [];
  }
}

async function importForm(formData) {
  try {
    log(`📤 Importing form: ${formData.title}`, 'cyan');
    
    // Check if form already exists
    const existingForms = await getExistingForms();
    const existingForm = existingForms.find(form => 
      form.name === formData.name || form.path === formData.path
    );

    if (existingForm) {
      log(`⚠️  Form "${formData.title}" already exists. Skipping import.`, 'yellow');
      return existingForm;
    }

    // Import the form
    const importedForm = await makeRequest(`${FORMIO_BASE_URL}/form`, {
      method: 'POST',
      body: JSON.stringify(formData)
    });

    log(`✅ Successfully imported form: ${formData.title}`, 'green');
    log(`   📍 Form ID: ${importedForm._id}`, 'blue');
    log(`   🔗 Form URL: ${FORMIO_BASE_URL}/form/${importedForm._id}`, 'blue');
    
    return importedForm;
  } catch (error) {
    log(`❌ Failed to import form "${formData.title}": ${error.message}`, 'red');
    throw error;
  }
}

async function loadFormFromFile(filePath) {
  try {
    log(`📖 Loading form from: ${path.basename(filePath)}`, 'cyan');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const formData = JSON.parse(fileContent);
    
    // Validate required fields
    if (!formData.title || !formData.name || !formData.components) {
      throw new Error('Invalid form JSON: missing required fields (title, name, components)');
    }
    
    log(`📋 Loaded form: ${formData.title}`, 'green');
    return formData;
  } catch (error) {
    log(`❌ Failed to load form from ${filePath}: ${error.message}`, 'red');
    throw error;
  }
}

async function importAllForms() {
  try {
    log('🚀 Starting Form.io form import process...', 'cyan');
    
    // Check server connectivity
    const serverAccessible = await checkFormioServer();
    if (!serverAccessible) {
      process.exit(1);
    }

    // Authenticate as admin
    const authenticated = await authenticateAdmin();
    if (!authenticated) {
      process.exit(1);
    }

    // Get list of form files
    const files = await fs.readdir(FORMS_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      log('⚠️  No JSON form files found in ' + FORMS_DIR, 'yellow');
      return;
    }

    log(`📁 Found ${jsonFiles.length} form file(s) to import`, 'blue');

    const results = [];
    
    // Import each form
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(FORMS_DIR, file);
        const formData = await loadFormFromFile(filePath);
        const result = await importForm(formData);
        results.push({ file, success: true, form: result });
      } catch (error) {
        log(`❌ Failed to process ${file}: ${error.message}`, 'red');
        results.push({ file, success: false, error: error.message });
      }
    }

    // Summary
    log('\n📊 Import Summary:', 'cyan');
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    log(`✅ Successfully imported: ${successful.length} forms`, 'green');
    if (failed.length > 0) {
      log(`❌ Failed to import: ${failed.length} forms`, 'red');
      failed.forEach(f => log(`   - ${f.file}: ${f.error}`, 'red'));
    }

    if (successful.length > 0) {
      log('\n🎉 Forms are now available in Form.io!', 'green');
      log(`📱 Access admin panel: ${FORMIO_BASE_URL}`, 'blue');
      log('👤 Login: admin@example.com / password123', 'blue');
    }

  } catch (error) {
    log(`💥 Import process failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Handle command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Form.io Form Import Script

Usage: 
  node import-forms.js [options]

Options:
  --help, -h    Show this help message

Environment Variables:
  FORMIO_URL    Form.io server URL (default: http://localhost:3002)

Examples:
  node import-forms.js
  FORMIO_URL=http://localhost:3001 node import-forms.js
`);
    process.exit(0);
  }

  importAllForms();
}

module.exports = {
  importAllForms,
  importForm,
  loadFormFromFile,
  checkFormioServer
};