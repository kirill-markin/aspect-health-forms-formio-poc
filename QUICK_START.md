# 🚀 Quick Start Guide

Get your Form.io POC running in **3 minutes** with demo data!

## Prerequisites

- Docker & Docker Compose
- Node.js 18+
- npm or yarn

## One-Command Setup

```bash
./scripts/setup.sh
```

**This will:**
- ✅ Start Form.io server, MongoDB, and Redis
- ✅ Install React Native dependencies
- ✅ Create demo health survey forms automatically
- ✅ Validate complete setup

## Immediate Access

### 🏥 Form.io Admin Interface
**URL:** http://localhost:3001
**Login:** admin@example.com / password123

**What to check:**
- Browse to **Forms** section
- You should see pre-created demo forms:
  - "Health Survey Demo"
  - "Patient Intake Form"
- Click on any form to edit using the visual builder

### 📱 React Native Mobile App

```bash
cd app
npm start
# Press 'w' for web browser (easiest for testing)
```

**What to check:**
- App loads showing "Aspect Health Forms"
- Demo forms appear in the list automatically
- Click on "Health Survey Demo" to test

## 🧪 Complete Testing Flow (5 minutes)

### Step 1: Explore Form.io Admin (2 min)
1. Open http://localhost:3001
2. Login with admin@example.com / password123
3. Go to **Forms** → View "Health Survey Demo"
4. Notice the conditional logic rules (health concerns show based on rating)

### Step 2: Test Mobile App (2 min)
1. Open React Native app in browser
2. Tap "Health Survey Demo"
3. Fill out the form:
   - Enter your name and email
   - Select "Fair" for health rating → watch health concerns field appear
   - Complete the rest of the form
4. Submit the form

### Step 3: Verify Data Flow (1 min)
1. Go back to Form.io Admin
2. Navigate to **Forms** → "Health Survey Demo" → **Data** tab
3. You should see your submission with all the data

## 📋 Demo Forms Included

### Health Survey Demo
- **URL:** http://localhost:3001/health-survey-demo
- **Features:** Personal info, health rating with conditional logic, symptoms checklist, NPS score
- **Tests:** Conditional questions, form validation, mobile rendering

### Patient Intake Form
- **URL:** http://localhost:3001/patient-intake
- **Features:** Personal information panels, medical history, allergies
- **Tests:** Multi-panel forms, medical data collection

## 🔧 Quick Commands

```bash
# View all services status
docker-compose ps

# View Form.io logs
docker-compose logs -f formio-server

# Stop everything
docker-compose down

# Complete reset (removes all data)
docker-compose down -v && ./scripts/setup.sh

# Validate setup
./scripts/validate.sh

# Create more demo data
./scripts/seed-demo-data.sh
```

## 🚨 Troubleshooting Quick Fixes

### Form.io Admin won't load
```bash
# Check if Form.io is running
curl http://localhost:3001/health
# If not responding:
docker-compose restart formio-server
```

### No demo forms in admin
```bash
# Re-run demo data creation
./scripts/seed-demo-data.sh
```

### React Native app can't connect
```bash
# Check app environment
cat app/.env
# Should show: EXPO_PUBLIC_FORMIO_URL=http://localhost:3001
```

### Mobile app shows empty form list
- Check Form.io admin has forms created
- Refresh the mobile app
- Check browser console for API errors

## ✅ Success Checklist

- [ ] Form.io admin loads at http://localhost:3001
- [ ] Can login with admin@example.com / password123
- [ ] Demo forms visible in Forms section
- [ ] React Native app shows form list
- [ ] Can complete and submit a form
- [ ] Submission data appears in Form.io admin

**All checked?** 🎉 **You're ready to build healthcare forms!**

---

## Next Steps

- **Create Custom Forms:** Use Form.io's visual builder to create new forms
- **Test Conditional Logic:** Add show/hide rules based on user responses
- **Integrate APIs:** Connect forms to external systems via webhooks
- **Deploy:** Follow production deployment guide in main README
- **Customize:** Modify React Native app styling and functionality