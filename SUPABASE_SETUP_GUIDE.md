# 🚀 GPS Shagi Hindkian - Complete Supabase Setup Guide

**School:** GPS Shagi Hindkian  
**Location:** Peshawar  
**Admin Email:** gpsshagihindkian@proton.me  
**Supabase Project:** https://wzdhjlgunbcvfnpnhqca.supabase.co

---

## 📋 Table of Contents

1. [Database Setup](#database-setup)
2. [Storage Configuration](#storage-configuration)
3. [Local Development](#local-development)
4. [Deployment](#deployment)
5. [User Management](#user-management)
6. [Troubleshooting](#troubleshooting)

---

## 🗄️ Database Setup

### Step 1: Run Database Schema

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `gps-shagi-hindkian`
3. Click "SQL Editor" (left sidebar)
4. Click "New Query"
5. Copy the entire contents of `DATABASE_SCHEMA.sql`
6. Paste into the SQL Editor
7. Click "Run"

**Expected result:** All tables created successfully ✅

### Step 2: Verify Tables Created

In Supabase Dashboard → Table Editor:

- [ ] `users` - User profiles and roles
- [ ] `teachers` - Teacher information
- [ ] `admin_staff` - Admin staff information
- [ ] `teacher_documents` - Teacher document metadata
- [ ] `office_documents` - Office document metadata
- [ ] `document_access_logs` - Access audit logs

### Step 3: Enable Row-Level Security

Already configured in the SQL schema. Verify in Supabase:

1. Click "Authentication" (left sidebar)
2. Click "Policies"
3. You should see policies for all tables

---

## 📦 Storage Configuration

### Step 1: Create Storage Buckets

You already created two buckets:
- ✅ `teachers-documents`
- ✅ `office-documents`

### Step 2: Configure Storage Policies

**For `teachers-documents` bucket:**

1. Click "Storage" (left sidebar)
2. Click `teachers-documents` bucket
3. Click "Policies" tab
4. Add these policies:

**Policy 1: Teachers Upload**
```sql
CREATE POLICY "Teachers can upload own documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'teachers-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

**Policy 2: Teachers Download**
```sql
CREATE POLICY "Teachers can download own documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'teachers-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

**Policy 3: Teachers Delete**
```sql
CREATE POLICY "Teachers can delete own documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'teachers-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

**Policy 4: Admins Full Access**
```sql
CREATE POLICY "Admins manage teachers documents"
  ON storage.objects
  USING (
    bucket_id = 'teachers-documents' AND
    (SELECT role FROM auth.users WHERE auth.users.id = auth.uid()) = 'admin'
  );
```

---

**For `office-documents` bucket:**

Add single policy:

```sql
CREATE POLICY "Only admins access office documents"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'office-documents' AND
    (SELECT role FROM auth.users WHERE auth.users.id = auth.uid()) = 'admin'
  );
```

---

## 💻 Local Development

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Setup Environment Variables

```bash
cp .env.example .env.local
```

Your `.env.local` is already filled with:
- ✅ Supabase URL
- ✅ Anon Key
- ✅ Service Role Key
- ✅ School info (GPS Shagi Hindkian, Peshawar)

### Step 3: Run Development Server

```bash
npm run dev
```

App will run at: http://localhost:3000

### Step 4: Test Authentication

1. Go to http://localhost:3000/auth
2. Click "Signup"
3. Enter:
   - Full Name: Your name
   - Email: test@example.com
   - Password: TestPassword123
4. Should see: "Signup successful! Check your email..."

### Step 5: Create First Admin User

Manually in Supabase Dashboard:

1. Go to Authentication → Users
2. Click "Create user"
3. Email: gpsshagihindkian@proton.me
4. Password: Create a strong password
5. Click "Create user"

Then in SQL Editor, run:

```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'gpsshagihindkian@proton.me';
```

### Step 6: Create Teacher Account

Test signup as a teacher:

1. Go to http://localhost:3000/auth
2. Signup with teacher email
3. Create teacher profile in Supabase dashboard
4. Link teacher to user account

---

## 🚀 Deployment

### Step 1: Prepare for Deployment

```bash
npm run build
npm run type-check
```

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Complete Supabase integration for GPS Shagi Hindkian"
git push origin main
```

### Step 3: Deploy to Vercel

#### Option A: Using Vercel Dashboard

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Click "Configure Project"
5. Add environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://wzdhjlgunbcvfnpnhqca.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[from .env.local]
SUPABASE_SERVICE_ROLE_KEY=[from .env.local]
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

6. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

### Step 4: Update Supabase Redirect URI

1. Go to Supabase Dashboard
2. Click "Authentication" → "Providers" → "Email"
3. Update redirect URIs to include your Vercel URL:

```
https://your-vercel-domain.vercel.app/auth
```

### Step 5: Test Live App

1. Go to https://your-vercel-domain.vercel.app
2. Test signup
3. Test login
4. Test document upload
5. Check Supabase dashboard for new records

---

## 👥 User Management

### Add Teacher

**Option A: Self-signup**

Teacher:
1. Go to app
2. Click "Signup"
3. Enter details
4. Admin verifies

**Option B: Admin creates**

Admin in Supabase Dashboard:
1. SQL Editor
2. Run:

```sql
-- Create auth user
INSERT INTO auth.users (
  email, 
  encrypted_password, 
  email_confirmed_at
) VALUES (
  'teacher@example.com',
  crypt('TempPassword123', gen_salt('bf')),
  now()
);

-- Get the user ID and insert into users table
INSERT INTO public.users (
  id, 
  email, 
  full_name, 
  role, 
  status
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'teacher@example.com'),
  'teacher@example.com',
  'Teacher Name',
  'teacher',
  'active'
);

-- Create teacher profile
INSERT INTO public.teachers (
  user_id, 
  full_name, 
  email, 
  subject, 
  department, 
  status
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'teacher@example.com'),
  'Teacher Name',
  'teacher@example.com',
  'Subject',
  'Department',
  'active'
);
```

### Add Admin Staff

Similar to teacher, but:
1. Set role to `'admin'` in users table
2. Insert into `admin_staff` table instead

### Deactivate User

```sql
UPDATE public.users 
SET status = 'inactive' 
WHERE email = 'user@example.com';
```

---

## 🔐 Security Best Practices

### 1. Row-Level Security (RLS)

✅ Enabled on all tables  
✅ Teachers can only access own documents  
✅ Admins can access everything  
✅ Public cannot access anything

### 2. Storage Security

✅ Authenticated users only  
✅ Teachers isolated by folder  
✅ Admins full access  
✅ Automatic virus scan (Supabase feature)

### 3. Environment Variables

✅ ANON_KEY: Public, safe for frontend  
✅ SERVICE_ROLE_KEY: Secret, server-only  
✅ Never commit keys to git  
✅ Use Vercel secrets for production

### 4. Password Policy

Teachers must use strong passwords:
- Minimum 8 characters
- Mix of upper and lowercase
- At least one number
- At least one special character

### 5. Data Encryption

✅ All data encrypted in transit (HTTPS)  
✅ All data encrypted at rest  
✅ Backup automatic daily  
✅ Retention: 30 days

---

## 🐛 Troubleshooting

### Issue: "Unauthorized" on upload

**Solution:**
1. Check authorization header in request
2. Verify Supabase token is valid
3. Check user role in database
4. Verify RLS policies are set

### Issue: "File type not allowed"

**Solution:**
1. Check file MIME type
2. Update `ALLOWED_MIME_TYPES` if needed
3. Only PDF, Doc, Excel, PPT, images, text allowed

### Issue: "Document not found"

**Solution:**
1. Verify document ID is correct
2. Check teacher_id matches current user
3. Verify row-level security policies

### Issue: Files not appearing in Supabase Storage

**Solution:**
1. Check upload response for errors
2. Verify bucket name is correct
3. Check storage policies
4. Look at browser console for errors

### Issue: Can't login after signup

**Solution:**
1. Check email in users table
2. Verify user profile was created
3. Check auth.users in Supabase
4. Verify email is confirmed
5. Try password reset

### Issue: "Service role key not set"

**Solution:**
1. Verify `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
2. Check Supabase Dashboard for correct key
3. Restart development server after env change

---

## 📊 Database Maintenance

### Backup

Supabase automatically backs up:
- ✅ Daily backups
- ✅ 30-day retention
- ✅ Point-in-time recovery

To backup manually:
1. Go to Supabase Dashboard
2. Click "Database" → "Backups"
3. Click "Create backup"

### Monitor Usage

1. Go to Supabase Dashboard
2. Click "Database" → "Usage"
3. Check:
   - Storage used
   - Rows in each table
   - Backup size

### Clean Old Access Logs

```sql
DELETE FROM public.document_access_logs
WHERE timestamp < NOW() - INTERVAL '90 days';
```

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] All database tables created
- [ ] Row-level security policies active
- [ ] Storage buckets configured
- [ ] Storage policies applied
- [ ] Environment variables set
- [ ] Local development working
- [ ] Admin account created
- [ ] Test teacher account created
- [ ] Document upload works
- [ ] Document download works
- [ ] Document delete works
- [ ] Deployed to Vercel
- [ ] Live app working
- [ ] Supabase redirect URI updated
- [ ] Email verification working

---

## 📞 Support

### Supabase Help

- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- Status: https://status.supabase.com

### App Help

- GitHub Issues: Check repository
- Email: gpsshagihindkian@proton.me

---

## 🎉 Next Steps

1. ✅ Setup database (DATABASE_SCHEMA.sql)
2. ✅ Configure storage buckets
3. ✅ Setup environment variables
4. ✅ Run `npm install && npm run dev`
5. ✅ Test locally
6. ✅ Deploy to Vercel
7. ✅ Invite teachers to signup
8. ✅ Start managing documents!

---

**Status:** Complete & Ready for Production ✅

**Developed by:** Jamal Abdul Nasir  
**For:** GPS Shagi Hindkian School, Peshawar  
**Date:** August 2026
