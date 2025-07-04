#!/bin/bash

# Form.io Demo Data Seeding Script
# Creates sample forms in Form.io server for immediate testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FORMIO_URL="http://localhost:3001"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASS="password123"

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Wait for Form.io server to be ready
wait_for_formio() {
    print_header "Waiting for Form.io Server"
    
    local retries=0
    local max_retries=20
    
    while [ $retries -lt $max_retries ]; do
        if curl -f "${FORMIO_URL}/health" &> /dev/null; then
            print_success "Form.io server is ready"
            return 0
        fi
        
        retries=$((retries + 1))
        print_status "Waiting for Form.io server... (attempt $retries/$max_retries)"
        sleep 3
    done
    
    print_error "Form.io server failed to respond after $max_retries attempts"
    return 1
}

# Authenticate with Form.io and get token
authenticate() {
    print_header "Authenticating with Form.io"
    
    local auth_response=$(curl -s -X POST "${FORMIO_URL}/user/login" \
        -H "Content-Type: application/json" \
        -d "{\"data\":{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASS}\"}}")
    
    if [ $? -eq 0 ]; then
        # Extract token from response headers in a more reliable way
        local token=$(curl -s -D - -X POST "${FORMIO_URL}/user/login" \
            -H "Content-Type: application/json" \
            -d "{\"data\":{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASS}\"}}" \
            2>/dev/null | grep -i "x-jwt-token" | cut -d' ' -f2 | tr -d '\r\n')
        
        if [ -n "$token" ]; then
            print_success "Authentication successful"
            echo "$token"
            return 0
        fi
    fi
    
    print_error "Authentication failed"
    return 1
}

# Create a form using Form.io API
create_form() {
    local form_file="$1"
    local token="$2"
    local form_name=$(basename "$form_file" .json)
    
    print_status "Creating form from $form_file"
    
    if [ ! -f "$form_file" ]; then
        print_error "Form file not found: $form_file"
        return 1
    fi
    
    local response=$(curl -s -w "\n%{http_code}" -X POST "${FORMIO_URL}/form" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d @"$form_file")
    
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
        local form_id=$(echo "$body" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
        print_success "Created form: $form_name (ID: $form_id)"
        return 0
    else
        print_error "Failed to create form $form_name (HTTP $http_code)"
        echo "Response: $body"
        return 1
    fi
}

# Create simple health survey form programmatically
create_simple_health_survey() {
    local token="$1"
    
    print_status "Creating Simple Health Survey form"
    
    # Create a simple form JSON
    local form_json='{
        "title": "Health Survey Demo",
        "name": "healthSurveyDemo",
        "path": "health-survey-demo",
        "type": "form",
        "display": "form",
        "components": [
            {
                "type": "textfield",
                "key": "fullName",
                "label": "Full Name",
                "placeholder": "Enter your full name",
                "input": true,
                "required": true,
                "validate": {
                    "required": true,
                    "minLength": 2,
                    "maxLength": 100
                }
            },
            {
                "type": "email",
                "key": "email",
                "label": "Email Address",
                "placeholder": "Enter your email",
                "input": true,
                "required": true,
                "validate": {
                    "required": true
                }
            },
            {
                "type": "number",
                "key": "age",
                "label": "Age",
                "placeholder": "Enter your age",
                "input": true,
                "required": true,
                "validate": {
                    "required": true,
                    "min": 18,
                    "max": 120
                }
            },
            {
                "type": "radio",
                "key": "healthRating",
                "label": "How would you rate your overall health?",
                "input": true,
                "required": true,
                "values": [
                    {"label": "Excellent", "value": "excellent"},
                    {"label": "Very Good", "value": "very_good"},
                    {"label": "Good", "value": "good"},
                    {"label": "Fair", "value": "fair"},
                    {"label": "Poor", "value": "poor"}
                ]
            },
            {
                "type": "textarea",
                "key": "healthConcerns",
                "label": "Do you have any specific health concerns?",
                "placeholder": "Please describe any health concerns...",
                "input": true,
                "required": false,
                "conditional": {
                    "show": true,
                    "when": "healthRating",
                    "eq": "fair"
                }
            },
            {
                "type": "textarea",
                "key": "urgentConcerns",
                "label": "Please describe your urgent health concerns:",
                "placeholder": "Please provide details about your health concerns...",
                "input": true,
                "required": true,
                "conditional": {
                    "show": true,
                    "when": "healthRating",
                    "eq": "poor"
                }
            },
            {
                "type": "selectboxes",
                "key": "symptoms",
                "label": "Are you currently experiencing any of these symptoms?",
                "input": true,
                "values": [
                    {"label": "Fatigue", "value": "fatigue"},
                    {"label": "Headaches", "value": "headaches"},
                    {"label": "Difficulty sleeping", "value": "insomnia"},
                    {"label": "Digestive issues", "value": "digestive"},
                    {"label": "Joint pain", "value": "joint_pain"},
                    {"label": "Mood changes", "value": "mood_changes"},
                    {"label": "None of the above", "value": "none"}
                ]
            },
            {
                "type": "survey",
                "key": "satisfaction",
                "label": "Healthcare Satisfaction",
                "input": true,
                "questions": [
                    {
                        "label": "How satisfied are you with our healthcare services?",
                        "value": "service_satisfaction"
                    }
                ],
                "values": [
                    {"label": "Very Dissatisfied", "value": 1},
                    {"label": "Dissatisfied", "value": 2},
                    {"label": "Neutral", "value": 3},
                    {"label": "Satisfied", "value": 4},
                    {"label": "Very Satisfied", "value": 5}
                ]
            },
            {
                "type": "number",
                "key": "npsScore",
                "label": "On a scale of 0-10, how likely are you to recommend our services?",
                "input": true,
                "validate": {
                    "min": 0,
                    "max": 10
                }
            },
            {
                "type": "checkbox",
                "key": "consent",
                "label": "I consent to the collection and use of my health information",
                "input": true,
                "required": true
            }
        ],
        "tags": ["health", "survey", "demo"]
    }'
    
    local response=$(curl -s -w "\n%{http_code}" -X POST "${FORMIO_URL}/form" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "$form_json")
    
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
        local form_id=$(echo "$body" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
        print_success "Created Health Survey Demo form (ID: $form_id)"
        echo "  • Form URL: ${FORMIO_URL}/form/${form_id}"
        echo "  • Form Path: ${FORMIO_URL}/health-survey-demo"
        return 0
    else
        print_error "Failed to create Health Survey Demo form (HTTP $http_code)"
        echo "Response: $body"
        return 1
    fi
}

# Create patient intake form
create_patient_intake_form() {
    local token="$1"
    
    print_status "Creating Patient Intake form"
    
    local form_json='{
        "title": "Patient Intake Form",
        "name": "patientIntakeForm",
        "path": "patient-intake",
        "type": "form",
        "display": "form",
        "components": [
            {
                "type": "panel",
                "key": "personalInfo",
                "title": "Personal Information",
                "components": [
                    {
                        "type": "textfield",
                        "key": "firstName",
                        "label": "First Name",
                        "input": true,
                        "required": true
                    },
                    {
                        "type": "textfield",
                        "key": "lastName",
                        "label": "Last Name",
                        "input": true,
                        "required": true
                    },
                    {
                        "type": "datetime",
                        "key": "dateOfBirth",
                        "label": "Date of Birth",
                        "input": true,
                        "required": true,
                        "format": "yyyy-MM-dd"
                    },
                    {
                        "type": "select",
                        "key": "gender",
                        "label": "Gender",
                        "input": true,
                        "data": {
                            "values": [
                                {"label": "Male", "value": "male"},
                                {"label": "Female", "value": "female"},
                                {"label": "Non-binary", "value": "non_binary"},
                                {"label": "Prefer not to say", "value": "prefer_not_to_say"}
                            ]
                        }
                    }
                ]
            },
            {
                "type": "panel",
                "key": "medicalHistory",
                "title": "Medical History",
                "components": [
                    {
                        "type": "selectboxes",
                        "key": "medicalConditions",
                        "label": "Current Medical Conditions",
                        "input": true,
                        "values": [
                            {"label": "Diabetes", "value": "diabetes"},
                            {"label": "High Blood Pressure", "value": "hypertension"},
                            {"label": "Heart Disease", "value": "heart_disease"},
                            {"label": "Asthma", "value": "asthma"},
                            {"label": "None", "value": "none"}
                        ]
                    },
                    {
                        "type": "textarea",
                        "key": "medications",
                        "label": "Current Medications",
                        "placeholder": "List all current medications...",
                        "input": true
                    },
                    {
                        "type": "textarea",
                        "key": "allergies",
                        "label": "Known Allergies",
                        "placeholder": "List any known allergies...",
                        "input": true
                    }
                ]
            }
        ],
        "tags": ["patient", "intake", "medical"]
    }'
    
    local response=$(curl -s -w "\n%{http_code}" -X POST "${FORMIO_URL}/form" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "$form_json")
    
    local http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
        print_success "Created Patient Intake form"
        return 0
    else
        print_error "Failed to create Patient Intake form (HTTP $http_code)"
        return 1
    fi
}

# Main seeding function
seed_demo_data() {
    print_header "Form.io Demo Data Seeding"
    
    # Wait for Form.io to be ready
    if ! wait_for_formio; then
        print_error "Form.io server is not ready. Please ensure it's running."
        exit 1
    fi
    
    # Authenticate and get token
    local token=$(authenticate)
    if [ $? -ne 0 ] || [ -z "$token" ]; then
        print_error "Failed to authenticate with Form.io"
        exit 1
    fi
    
    # Create demo forms
    print_header "Creating Demo Forms"
    
    # Create simple health survey
    create_simple_health_survey "$token"
    
    # Create patient intake form
    create_patient_intake_form "$token"
    
    # Create forms from JSON files if they exist
    if [ -d "infra/sample-forms" ]; then
        for form_file in infra/sample-forms/*.json; do
            if [ -f "$form_file" ]; then
                create_form "$form_file" "$token"
            fi
        done
    fi
    
    print_header "Demo Data Seeding Complete!"
    
    echo -e "${GREEN}✅ Demo forms have been created successfully!${NC}\n"
    
    echo -e "${BLUE}📋 Available Demo Forms:${NC}"
    echo -e "  • Health Survey Demo: ${YELLOW}${FORMIO_URL}/health-survey-demo${NC}"
    echo -e "  • Patient Intake Form: ${YELLOW}${FORMIO_URL}/patient-intake${NC}"
    
    echo -e "\n${BLUE}🏥 Admin Interface:${NC}"
    echo -e "  • Form.io Admin: ${YELLOW}${FORMIO_URL}${NC}"
    echo -e "  • Login: ${YELLOW}${ADMIN_EMAIL}${NC} / ${YELLOW}${ADMIN_PASS}${NC}"
    
    echo -e "\n${BLUE}🧪 Testing:${NC}"
    echo -e "  1. Open Form.io admin to view/edit forms"
    echo -e "  2. Start React Native app: ${YELLOW}cd app && npm start${NC}"
    echo -e "  3. Forms should appear in the mobile app automatically"
    
    echo -e "\n${GREEN}Ready for testing! 🎯${NC}"
}

# Run main function if script is executed directly
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    seed_demo_data "$@"
fi