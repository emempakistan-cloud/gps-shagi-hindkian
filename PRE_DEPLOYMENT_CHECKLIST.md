# Pre-Deployment Checklist

## 1. Vercel Environment Variables — set ALL of these
Go to your Vercel project → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://wzdhjlgunbcvfnpnhqca.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>
SUPABASE_SERVICE_ROLE_KEY=<your service role key>   <-- CRITICAL, don't skip
NEXT_PUBLIC_APP_URL=https://gpsshagihindkian.vercel.app
NEXT_PUBLIC_SCHOOL_NAME=GPS Shagi Hindkian
NEXT_PUBLIC_SCHOOL_CITY=Peshawar
NEXT_PUBLIC_SCHOOL_ID=gps-shagi-hindkian
ADMIN_EMAIL=gpsshagihindkian@proton.me
NEXT_PUBLIC_STORAGE_BUCKET_TEACHERS=teachers-documents
NEXT_PUBLIC_STORAGE_BUCKET_OFFICE=office-documents
```
Same values as your local `.env.local` — just copy them over.

## 2. Push the CURRENT code to GitHub
A lot has changed since the original repo push. Make sure everything
we fixed today is committed:
```powershell
git add .
git commit -m "Fix RLS, upload, approval workflow bugs"
git push
```
Vercel will auto-redeploy on push if already connected.

## 3. Update Supabase Auth redirect URI
Supabase Dashboard → Authentication → URL Configuration →
add `https://gpsshagihindkian.vercel.app/auth` to Redirect URLs.

## 4. Check storage bucket is Public (needed for downloads)
Supabase Dashboard → Storage → click `teachers-documents` bucket →
check it's set to Public. Repeat for `office-documents`.
If either is Private, downloads will fail even though upload works.

## 5. After deploying, retest the same 3 things on the LIVE site
- Sign up a fresh test account
- Approve it as admin
- Upload + download + delete a file
