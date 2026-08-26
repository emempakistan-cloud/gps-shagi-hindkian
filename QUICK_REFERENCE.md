# ⚡ QUICK REFERENCE CARD
## GPS Shagi Hindkian - Teacher DATA App Deployment

---

## 📋 PHASE 1: DATABASE (5 min)
```
1. Go: https://app.supabase.com
2. Project: gps-shagi-hindkian
3. SQL Editor → New Query
4. Copy: DATABASE_SCHEMA_FIXED.sql
5. Paste → Run
✅ Done!
```

---

## 💻 PHASE 2: LOCAL SETUP (10 min)
```bash
mkdir gps-shagi-hindkian
cd gps-shagi-hindkian

# Copy ALL files from /mnt/user-data/outputs/

npm install
cp .env.example .env.local
npm run dev

# Visit: http://localhost:3000/auth
```

---

## ✅ PHASE 3: TEST (5 min)
```
1. Signup: testteacher@example.com
2. Check Supabase Dashboard → Users
3. Stop server: Ctrl+C
```

---

## 🐙 PHASE 4: GITHUB (5 min)
```bash
git init
git add .
git commit -m "GPS Shagi Hindkian Teacher DATA App"
git branch -M main
git remote add origin [YOUR_GITHUB_REPO]
git push -u origin main
```

---

## 🚀 PHASE 5: VERCEL (5 min)
```
1. Go: https://vercel.com
2. Add New Project
3. Import from GitHub
4. Add Environment Variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - NEXT_PUBLIC_APP_URL
   - (All others in .env.local)
5. Deploy!
```

---

## 🔧 PHASE 6: FINAL (5 min)
```
1. Supabase → Authentication → Email
2. Update Redirect URI:
   https://[your-vercel-domain].vercel.app/auth

3. Create Admin:
   UPDATE public.users 
   SET role = 'admin' 
   WHERE email = 'gpsshagihindkian@proton.me';
```

---

## ✨ FILES YOU NEED

**Database:**
- DATABASE_SCHEMA_FIXED.sql

**Configuration:**
- .env.example → .env.local
- package.json
- vercel.json

**All in:** `/mnt/user-data/outputs/`

---

## 🎯 WHAT TO RUN

```bash
# Check Node version
node --version  # Should be 18+

# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build
```

---

## 🌐 URLS YOU'LL USE

**Supabase:** https://app.supabase.com  
**GitHub:** https://github.com  
**Vercel:** https://vercel.com  
**Local:** http://localhost:3000  
**Live:** https://your-vercel-domain.vercel.app  

---

## 🔑 CREDENTIALS (Already in .env.example)

```
NEXT_PUBLIC_SUPABASE_URL=https://wzdhjlgunbcvfnpnhqca.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[PROVIDED]
SUPABASE_SERVICE_ROLE_KEY=[PROVIDED]
NEXT_PUBLIC_APP_URL=https://[your-domain].vercel.app
ADMIN_EMAIL=gpsshagihindkian@proton.me
```

---

## ✅ SUCCESS CHECKLIST

After deployment:
- [ ] App loads
- [ ] Can signup
- [ ] Can login
- [ ] Dashboard visible
- [ ] Can upload file
- [ ] Can download file
- [ ] Admin can delete file
- [ ] No console errors

✅ All checked? You're done! 🎉

---

## 📞 QUICK HELP

| Problem | Solution |
|---------|----------|
| npm install fails | `npm cache clean --force` |
| Can't connect Supabase | Check .env.local keys |
| Tables don't exist | Run DATABASE_SCHEMA_FIXED.sql |
| Upload fails | Check file < 100MB |
| Can't login | Check Supabase users table |

---

## ⏱️ TOTAL TIME

Phase 1: 5 min  
Phase 2: 10 min  
Phase 3: 5 min  
Phase 4: 5 min  
Phase 5: 5 min  
Phase 6: 5 min  

**TOTAL: ~30 minutes to production! 🚀**

---

**Status:** ✅ READY TO DEPLOY

Print this page or keep it open while following COMPLETE_DEPLOYMENT_GUIDE.md

