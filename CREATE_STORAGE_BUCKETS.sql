-- ==========================================
-- Create GPS Shagi Hindkian storage buckets
-- ==========================================
-- Prefixed "gsh-" for the same reason all tables were renamed earlier -
-- this project is shared with another app (NPS Portal), so unique names
-- prevent any possibility of collision, now or later.
--
-- Set to public=true so files can be downloaded via a direct public URL
-- without needing storage-level auth policies. Uploads/deletes still go
-- through supabaseAdmin server-side (service role key), which bypasses
-- storage restrictions regardless - so "public" here only affects reads,
-- which is exactly what downloads need.

INSERT INTO storage.buckets (id, name, public)
VALUES ('gsh-teachers-documents', 'gsh-teachers-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('gsh-office-documents', 'gsh-office-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

SELECT id, name, public FROM storage.buckets WHERE id LIKE 'gsh-%';
