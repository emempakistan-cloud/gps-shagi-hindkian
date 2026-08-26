-- GPS Shagi Hindkian - School Teacher & Office Document Archive
-- Supabase Database Schema
-- Run this in Supabase SQL Editor

-- ==========================================
-- 1. USERS TABLE (Extended Supabase Auth)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('teacher', 'admin', 'principal')) DEFAULT 'teacher',
  school_id TEXT DEFAULT 'gps-shagi-hindkian',
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. TEACHERS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  department TEXT,
  hire_date DATE,
  status TEXT CHECK (status IN ('active', 'inactive', 'on_leave')) DEFAULT 'active',
  school_id TEXT DEFAULT 'gps-shagi-hindkian',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. ADMIN STAFF TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.admin_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  position TEXT,
  department TEXT,
  phone TEXT,
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  school_id TEXT DEFAULT 'gps-shagi-hindkian',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. TEACHER DOCUMENTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.teacher_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('Personal', 'Education', 'Employment', 'Training', 'Other')),
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  description TEXT,
  school_id TEXT DEFAULT 'gps-shagi-hindkian',
  UNIQUE(teacher_id, category, file_name)
);

-- ==========================================
-- 5. OFFICE DOCUMENTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.office_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('Finance', 'HR', 'Administration', 'Compliance', 'Other')),
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  description TEXT,
  school_id TEXT DEFAULT 'gps-shagi-hindkian',
  UNIQUE(category, file_name)
);

-- ==========================================
-- 6. DOCUMENT ACCESS LOGS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.document_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  document_id UUID,
  document_type TEXT CHECK (document_type IN ('teacher', 'office')),
  action TEXT CHECK (action IN ('upload', 'download', 'delete', 'view', 'share')),
  file_name TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  school_id TEXT DEFAULT 'gps-shagi-hindkian'
);

-- ==========================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- USERS TABLE POLICIES
-- ==========================================

CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- ==========================================
-- TEACHERS TABLE POLICIES
-- ==========================================

CREATE POLICY "Teachers can read own profile"
  ON public.teachers
  FOR SELECT
  USING (user_id = auth.uid() OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can read all teachers"
  ON public.teachers
  FOR SELECT
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Teachers can update own profile"
  ON public.teachers
  FOR UPDATE
  USING (user_id = auth.uid());

-- ==========================================
-- ADMIN STAFF TABLE POLICIES
-- ==========================================

CREATE POLICY "Admins can read admin staff"
  ON public.admin_staff
  FOR SELECT
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can read own profile"
  ON public.admin_staff
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can update own profile"
  ON public.admin_staff
  FOR UPDATE
  USING (user_id = auth.uid());

-- ==========================================
-- TEACHER DOCUMENTS POLICIES
-- ==========================================

CREATE POLICY "Teachers can read own documents"
  ON public.teacher_documents
  FOR SELECT
  USING (
    teacher_id IN (
      SELECT id FROM public.teachers WHERE user_id = auth.uid()
    ) OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Teachers can insert own documents"
  ON public.teacher_documents
  FOR INSERT
  WITH CHECK (
    teacher_id IN (
      SELECT id FROM public.teachers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete own documents"
  ON public.teacher_documents
  FOR DELETE
  USING (
    teacher_id IN (
      SELECT id FROM public.teachers WHERE user_id = auth.uid()
    ) OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- ==========================================
-- OFFICE DOCUMENTS POLICIES
-- ==========================================

CREATE POLICY "Admins can read office documents"
  ON public.office_documents
  FOR SELECT
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can insert office documents"
  ON public.office_documents
  FOR INSERT
  WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can delete office documents"
  ON public.office_documents
  FOR DELETE
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- ==========================================
-- ACCESS LOGS POLICIES
-- ==========================================

CREATE POLICY "Users can read own access logs"
  ON public.document_access_logs
  FOR SELECT
  USING (user_id = auth.uid() OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "System can insert access logs"
  ON public.document_access_logs
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON public.teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON public.teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_admin_staff_user_id ON public.admin_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_documents_teacher_id ON public.teacher_documents(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_documents_category ON public.teacher_documents(category);
CREATE INDEX IF NOT EXISTS idx_office_documents_category ON public.office_documents(category);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON public.document_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON public.document_access_logs(timestamp);

-- ==========================================
-- VIEWS
-- ==========================================

-- Dashboard statistics view
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM public.teachers WHERE status = 'active') as active_teachers,
  (SELECT COUNT(*) FROM public.teacher_documents) as total_teacher_documents,
  (SELECT COUNT(*) FROM public.office_documents) as total_office_documents,
  (SELECT COUNT(*) FROM public.users WHERE role = 'teacher') as total_users,
  NOW() as last_updated;

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Function to get teacher's document count
CREATE OR REPLACE FUNCTION public.get_teacher_document_count(teacher_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM public.teacher_documents WHERE teacher_id = teacher_uuid;
$$ LANGUAGE SQL;

-- Function to get office document count by category
CREATE OR REPLACE FUNCTION public.get_office_documents_by_category(category_name TEXT)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM public.office_documents WHERE category = category_name;
$$ LANGUAGE SQL;

-- Function to log access
CREATE OR REPLACE FUNCTION public.log_document_access(
  p_user_id UUID,
  p_document_id UUID,
  p_doc_type TEXT,
  p_action TEXT,
  p_file_name TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.document_access_logs (
    user_id, document_id, document_type, action, file_name
  ) VALUES (
    p_user_id, p_document_id, p_doc_type, p_action, p_file_name
  );
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- STORAGE BUCKET POLICIES
-- ==========================================

-- Teachers documents storage policy
-- Note: Apply these in Supabase Dashboard under Storage > Policies

/*
TEACHERS DOCUMENTS BUCKET:

CREATE POLICY "Teachers can upload own documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'teachers-documents' AND
    (storage.foldername(name))[1]::uuid IN (
      SELECT id FROM public.teachers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can download own documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'teachers-documents' AND
    (storage.foldername(name))[1]::uuid IN (
      SELECT id FROM public.teachers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete own documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'teachers-documents' AND
    (storage.foldername(name))[1]::uuid IN (
      SELECT id FROM public.teachers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage teachers documents"
  ON storage.objects
  USING (
    bucket_id = 'teachers-documents' AND
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

OFFICE DOCUMENTS BUCKET:

CREATE POLICY "Only admins can access office documents"
  ON storage.objects
  USING (
    bucket_id = 'office-documents' AND
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );
*/

-- ==========================================
-- END OF SCHEMA
-- ==========================================
