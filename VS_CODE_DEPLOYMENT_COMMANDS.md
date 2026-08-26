# 🚀 VS CODE DEPLOYMENT COMMANDS
## GPS Shagi Hindkian - Teacher DATA App

**Deployment URL:** https://gpsshagihindkian.vercel.app  
**Total Time: ~30 minutes**

---

## ✅ PHASE 1: DATABASE SETUP (5 min)
### No VS Code needed - Do this in browser

1. Go to: https://app.supabase.com
2. Select project: `gps-shagi-hindkian`
3. Click "SQL Editor" (left sidebar)
4. Click "New Query"
5. **Copy entire contents of:** `DATABASE_SCHEMA_FIXED.sql`
6. **Paste into SQL Editor**
7. **Click "Run"**
8. ✅ Wait for success message (all 6 tables created)

---

## ✅ PHASE 2: LOCAL SETUP (10 min)
### VS Code Terminal Commands

### Step 2.1: Create Project Folder
```bash
# Open PowerShell in VS Code (Ctrl+`)
# Then run:

mkdir gps-shagi-hindkian
cd gps-shagi-hindkian
```

### Step 2.2: Copy Files
```
1. Copy ALL files from /mnt/user-data/outputs/
2. Paste into your gps-shagi-hindkian folder
3. Keep exact structure:
   ├── pages/
   ├── components/
   ├── lib/
   ├── styles/
   ├── package.json
   ├── .env.example
   └── ... (all files)
```

### Step 2.3: Open in VS Code
```bash
# In VS Code:
# File → Open Folder → Select gps-shagi-hindkian

# Or from PowerShell:
code .
```

### Step 2.4: Install Dependencies
```bash
npm install

# ⏱️ Wait 2-3 minutes...
```

### Step 2.5: Setup Environment File
```bash
cp .env.example .env.local
```

### Step 2.6: Start Development Server
```bash
npm run dev

# ✅ You should see:
# > ready - started server on 0.0.0.0:3000
```

### Step 2.7: Test in Browser
```
Open: http://localhost:3000

✅ Should see GPS Shagi Hindkian home page
```

---

## ✅ PHASE 3: TEST LOCALLY (5 min)

### Step 3.1: Signup Test
1. Go to: http://localhost:3000/auth
2. Click "Signup" tab
3. Enter:
   - Full Name: `Test Teacher`
   - Email: `testteacher@example.com`
   - Password: `TestPassword123`
4. Click "Signup"
5. ✅ Should see success message

### Step 3.2: Verify in Supabase
1. Go to: https://app.supabase.com
2. Select project: `gps-shagi-hindkian`
3. Click "Authentication" → "Users"
4. ✅ See `testteacher@example.com`

### Step 3.3: Stop Dev Server
```bash
Ctrl+C
```

---

## ✅ PHASE 4: GITHUB SETUP (5 min)

### Step 4.1: Initialize Git
```bash
git init
```

### Step 4.2: Add All Files
```bash
git add .
```

### Step 4.3: Create Commit
```bash
git commit -m "GPS Shagi Hindkian Teacher DATA App - Initial Commit"
```

### Step 4.4: Create GitHub Repository
**In browser:**
1. Go to: https://github.com
2. Click "+" → "New repository"
3. Name: `gps-shagi-hindkian-teacher-app`
4. Description: `GPS Shagi Hindkian School Teacher Document Archive`
5. Click "Create repository"

### Step 4.5: Connect to GitHub
**In VS Code PowerShell:**

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/YOUR_USERNAME/gps-shagi-hindkian-teacher-app.git
```

```bash
git push -u origin main
```

✅ Code on GitHub!

---

## ✅ PHASE 5: VERCEL DEPLOYMENT (5 min)
### Do this in browser

1. Go to: https://vercel.com
2. Click "Sign In" → "Continue with GitHub"
3. Authorize Vercel
4. Click "Add New Project"
5. Search: `gps-shagi-hindkian-teacher-app`
6. Click "Import"

### Step 5.1: Configure
- Framework: Next.js ✅
- Root Directory: . ✅

### Step 5.2: Add Environment Variables
Click "Environment Variables" and add each:

```
NEXT_PUBLIC_SUPABASE_URL
https://wzdhjlgunbcvfnpnhqca.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6ZGhqbGd1bmJjdmZucG5ocWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjA2MjIsImV4cCI6MjA5OTU5NjYyMn0.hn1tA5LjIFU8DCobXn-tyVLZFndRzjDV_x_Dy2G0pRc

SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6ZGhqbGd1bmJjdmZucG5ocWNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDAyMDYyMiwiZXhwIjoyMDk5NTk2NjIyfQ.SuOzifAv4B3CFG2zaCM-9nVOICC4k5k8LZ8euUHUENw

NEXT_PUBLIC_APP_URL
https://gpsshagihindkian.vercel.app

NEXT_PUBLIC_SCHOOL_NAME
GPS Shagi Hindkian

NEXT_PUBLIC_SCHOOL_CITY
Peshawar

NEXT_PUBLIC_SCHOOL_ID
gps-shagi-hindkian

ADMIN_EMAIL
gpsshagihindkian@proton.me
```

### Step 5.3: Deploy!
1. Click "Deploy"
2. ⏱️ Wait 2-3 minutes
3. ✅ See: "Congratulations!"
4. Click domain: https://gpsshagihindkian.vercel.app

---

## ✅ PHASE 6: FINAL CONFIGURATION (5 min)

### Step 6.1: Update Supabase Redirect URI
1. Go to: https://app.supabase.com
2. Select project: `gps-shagi-hindkian`
3. Click "Authentication" → "Providers" → "Email"
4. Find "Redirect URIs"
5. Add: `https://gpsshagihindkian.vercel.app/auth`
6. Click "Save"

### Step 6.2: Create Admin Account
1. Visit: https://gpsshagihindkian.vercel.app/auth
2. Click "Signup"
3. Enter:
   - Full Name: Admin Name
   - Email: `gpsshagihindkian@proton.me`
   - Password: (strong password)
4. Click "Signup"

### Step 6.3: Make User Admin
1. Go to: https://app.supabase.com
2. Click "SQL Editor" → "New Query"
3. Paste and run:

```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'gpsshagihindkian@proton.me';
```

### Step 6.4: Test Live App
1. Visit: https://gpsshagihindkian.vercel.app/auth
2. Login with admin account
3. Should see Dashboard
4. Try uploading a document
5. Try downloading it

✅ Live and working!

---

## 🎯 QUICK COMMAND COPY-PASTE

```bash
# Create & navigate
mkdir gps-shagi-hindkian
cd gps-shagi-hindkian

# Copy all files from /mnt/user-data/outputs/

# Install
npm install

# Setup environment
cp .env.example .env.local

# Test locally
npm run dev

# Stop server
Ctrl+C

# Git setup
git init
git add .
git commit -m "GPS Shagi Hindkian Teacher DATA App - Initial Commit"

# GitHub (replace YOUR_USERNAME)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gps-shagi-hindkian-teacher-app.git
git push -u origin main

# Then deploy from Vercel dashboard!
```

---

## 📊 SUCCESS CHECKLIST

- [ ] Phase 1: Database created (6 tables)
- [ ] Phase 2: npm install done
- [ ] Phase 3: Local test works (http://localhost:3000)
- [ ] Phase 4: Code on GitHub
- [ ] Phase 5: Deployed to Vercel
- [ ] Phase 6: Admin account created
- [ ] Final: App works at https://gpsshagihindkian.vercel.app

---

## 🎉 YOU'RE DONE!

**App Live At:** https://gpsshagihindkian.vercel.app

**Status:** ✅ PRODUCTION READY

**Total Time:** ~30 minutes 🚀
