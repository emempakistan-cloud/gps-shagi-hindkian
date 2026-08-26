# Final Deployment Walkthrough

## Step 1: Confirm your local project is in a clean, working state
```powershell
cd "C:\Users\Laptops HUB\Documents\teacherDATA\gps-shagi-hindkian"
npm run dev
```
Quickly confirm signup → approve → login → upload → download → delete all
still work locally before pushing. If yes, continue.

Stop the server (Ctrl+C) before continuing.

## Step 2: Git setup (if not already done)
Check if this is already a git repo:
```powershell
git status
```

If you see "not a git repository", initialize it:
```powershell
git init
git add .
git commit -m "GPS Shagi Hindkian - complete app"
```

If it's already a repo from earlier, just commit the latest changes:
```powershell
git add .
git commit -m "Final fixes before deployment"
```

## Step 3: Push to GitHub

If you don't have a GitHub repo for this yet:
1. Go to https://github.com → New repository
2. Name it: `gps-shagi-hindkian`
3. Don't initialize with README/gitignore (you already have files)
4. Create repository

Then connect and push:
```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gps-shagi-hindkian.git
git push -u origin main
```

If a remote already exists from earlier attempts, just push:
```powershell
git push
```

## Step 4: Deploy on Vercel

1. Go to https://vercel.com → Add New Project
2. Import your `gps-shagi-hindkian` GitHub repo
3. Framework should auto-detect as **Next.js**
4. Before clicking Deploy, add ALL of these Environment Variables
   (click "Environment Variables", add each one):

```
NEXT_PUBLIC_SUPABASE_URL=https://wzdhjlgunbcvfnpnhqca.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6ZGhqbGd1bmJjdmZucG5ocWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjA2MjIsImV4cCI6MjA5OTU5NjYyMn0.hn1tA5LjIFU8DCobXn-tyVLZFndRzjDV_x_Dy2G0pRc

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6ZGhqbGd1bmJjdmZucG5ocWNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDAyMDYyMiwiZXhwIjoyMDk5NTk2NjIyfQ.SuOzifAv4B3CFG2zaCM-9nVOICC4k5k8LZ8euUHUENw

NEXT_PUBLIC_APP_URL=https://gpsshagihindkian.vercel.app

NEXT_PUBLIC_SCHOOL_NAME=GPS Shagi Hindkian

NEXT_PUBLIC_SCHOOL_CITY=Peshawar

NEXT_PUBLIC_SCHOOL_ID=gps-shagi-hindkian

ADMIN_EMAIL=admin@gpssh.com

NEXT_PUBLIC_STORAGE_BUCKET_TEACHERS=gsh-teachers-documents

NEXT_PUBLIC_STORAGE_BUCKET_OFFICE=gsh-office-documents
```

**Note:** `SUPABASE_SERVICE_ROLE_KEY` is critical - almost every bug fixed
during development came back to this. Do not skip it.

5. Click **Deploy**
6. Wait 2-3 minutes for the build to complete

## Step 5: Update Supabase Auth redirect URI

Once deployed, you'll have a live URL like `https://gps-shagi-hindkian.vercel.app`
(or your custom domain if configured).

1. Supabase Dashboard → Authentication → URL Configuration
2. Add to Redirect URLs: `https://YOUR-ACTUAL-VERCEL-DOMAIN/auth`
3. Save

If your final domain differs from `gpsshagihindkian.vercel.app` (the one
baked into `NEXT_PUBLIC_APP_URL` above), also update that env var in
Vercel to match, then redeploy (Vercel → Deployments → ... → Redeploy).

## Step 6: Retest everything on the LIVE site

Don't skip this - local success doesn't guarantee production success.

1. Visit your live URL
2. Sign up a fresh test teacher account
3. Log in as admin@gpssh.com, approve that test account in Manage Teachers
4. Log out, log back in as the test teacher
5. Upload a document
6. Download it
7. Delete it
8. Confirm the Office tab and Manage Teachers tab work for admin

If all of that works on the live site, you are genuinely done. 🎉

## If something breaks in production but not locally

The most common cause is a missing or mistyped environment variable in
Vercel. Double-check every value in Step 4 matches exactly, especially:
- SUPABASE_SERVICE_ROLE_KEY (most critical)
- The two STORAGE_BUCKET values (must have the gsh- prefix)
