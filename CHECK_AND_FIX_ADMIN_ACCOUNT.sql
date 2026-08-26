-- ==========================================
-- STEP 1: See every account and its current role/status
-- ==========================================
-- Run this first to see exactly what's in your database right now.

SELECT id, email, full_name, role, status, created_at
FROM public.gsh_users
ORDER BY created_at DESC;


-- ==========================================
-- STEP 2: Fix your specific admin account
-- ==========================================
-- Replace the email below with whichever account you're actually
-- logged in with (check Step 1's results above for the right one).

UPDATE public.gsh_users
SET role = 'admin', status = 'active'
WHERE email = 'PUT_YOUR_ACTUAL_LOGIN_EMAIL_HERE';


-- ==========================================
-- STEP 3: Verify the fix
-- ==========================================
SELECT id, email, full_name, role, status
FROM public.gsh_users
WHERE email = 'PUT_YOUR_ACTUAL_LOGIN_EMAIL_HERE';
