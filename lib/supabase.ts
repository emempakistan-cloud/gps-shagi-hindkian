import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client (for server-side operations ONLY - e.g. API routes).
// Bypasses Row Level Security entirely, so it must only be used AFTER the
// calling API route has already verified the caller's identity/authorization
// itself (checked their Bearer token, checked role/ownership, etc).
// Guarded so this module doesn't crash when bundled into client-side code,
// where SUPABASE_SERVICE_ROLE_KEY is intentionally unavailable (not NEXT_PUBLIC_).
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
);

// Every service method below accepts an optional `client` parameter.
// - Called from the BROWSER (React components): omit it - defaults to the
//   anon `supabase` client, which carries the logged-in user's session, so
//   RLS policies correctly see auth.uid() and enforce access as normal.
// - Called from a Next.js API route (server-side): pass `supabaseAdmin`
//   explicitly. API routes verify the caller manually (Bearer token +
//   role/ownership checks) before calling these, so it's correct and
//   necessary to bypass RLS here - the anon client has NO session in a
//   server context, so auth.uid() would be NULL and RLS would hide rows
//   that genuinely belong to the caller, breaking things silently.

// ==========================================
// AUTHENTICATION TYPES
// ==========================================

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  role: 'teacher' | 'admin' | 'principal';
}

// ==========================================
// TEACHER OPERATIONS
// ==========================================

export class TeacherService {
  // Get all teachers
  static async getAllTeachers(client: SupabaseClient = supabase) {
    const { data, error } = await client
      .from('gsh_teachers')
      .select('*')
      .eq('status', 'active')
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Get teacher by ID
  static async getTeacher(teacherId: string, client: SupabaseClient = supabase) {
    const { data, error } = await client
      .from('gsh_teachers')
      .select('*')
      .eq('id', teacherId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Get current user's teacher profile
  static async getCurrentTeacherProfile(
    userId: string,
    client: SupabaseClient = supabase
  ) {
    const { data, error } = await client
      .from('gsh_teachers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Create new teacher
  static async createTeacher(teacherData: any, client: SupabaseClient = supabase) {
    const { data, error } = await client
      .from('gsh_teachers')
      .insert([teacherData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update teacher
  static async updateTeacher(
    teacherId: string,
    updates: any,
    client: SupabaseClient = supabase
  ) {
    const { data, error } = await client
      .from('gsh_teachers')
      .update(updates)
      .eq('id', teacherId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get teacher document count
  static async getDocumentCount(
    teacherId: string,
    client: SupabaseClient = supabase
  ) {
    const { count, error } = await client
      .from('gsh_teacher_documents')
      .select('*', { count: 'exact', head: true })
      .eq('teacher_id', teacherId);

    if (error) throw error;
    return count;
  }
}

// ==========================================
// ADMIN STAFF OPERATIONS
// ==========================================

export class AdminService {
  // Get all admin staff
  static async getAllAdminStaff(client: SupabaseClient = supabase) {
    const { data, error } = await client
      .from('gsh_admin_staff')
      .select('*')
      .eq('status', 'active')
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Get current user's admin profile
  static async getCurrentAdminProfile(
    userId: string,
    client: SupabaseClient = supabase
  ) {
    const { data, error } = await client
      .from('gsh_admin_staff')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Create new admin staff
  static async createAdminStaff(
    adminData: any,
    client: SupabaseClient = supabase
  ) {
    const { data, error } = await client
      .from('gsh_admin_staff')
      .insert([adminData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// ==========================================
// TEACHER DOCUMENTS OPERATIONS
// ==========================================

export class TeacherDocumentService {
  // Get all documents for a teacher
  static async getTeacherDocuments(
    teacherId: string,
    client: SupabaseClient = supabase
  ) {
    const { data, error } = await client
      .from('gsh_teacher_documents')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Get documents by category
  static async getDocumentsByCategory(
    teacherId: string,
    category: string,
    client: SupabaseClient = supabase
  ) {
    const { data, error } = await client
      .from('gsh_teacher_documents')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('category', category)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Add document metadata
  static async addDocumentMetadata(
    documentData: any,
    client: SupabaseClient = supabase
  ) {
    const { data, error } = await client
      .from('gsh_teacher_documents')
      .insert([documentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get a single document by ID (needed before deleting, to get storage_path)
  static async getDocument(
    documentId: string,
    client: SupabaseClient = supabase
  ) {
    const { data, error } = await client
      .from('gsh_teacher_documents')
      .select('*')
      .eq('id', documentId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Delete document
  static async deleteDocument(
    documentId: string,
    client: SupabaseClient = supabase
  ) {
    const { error } = await client
      .from('gsh_teacher_documents')
      .delete()
      .eq('id', documentId);

    if (error) throw error;
  }

  // Search documents
  static async searchDocuments(
    teacherId: string,
    query: string,
    client: SupabaseClient = supabase
  ) {
    const { data, error } = await client
      .from('gsh_teacher_documents')
      .select('*')
      .eq('teacher_id', teacherId)
      .or(`file_name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}

// ==========================================
// OFFICE DOCUMENTS OPERATIONS
// ==========================================

export class OfficeDocumentService {
  // Get all office documents
  static async getAllOfficeDocuments(client: SupabaseClient = supabase) {
    const { data, error } = await client
      .from('gsh_office_documents')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Get documents by category
  static async getDocumentsByCategory(
    category: string,
    client: SupabaseClient = supabase
  ) {
    const { data, error } = await client
      .from('gsh_office_documents')
      .select('*')
      .eq('category', category)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Get category stats
  static async getCategoryStats(client: SupabaseClient = supabase) {
    const categories = ['Finance', 'HR', 'Administration', 'Compliance', 'Other'];
    const stats = [];

    for (const category of categories) {
      const { count } = await client
        .from('gsh_office_documents')
        .select('*', { count: 'exact', head: true })
        .eq('category', category);

      stats.push({ category, count: count || 0 });
    }

    return stats;
  }

  // Add document metadata
  static async addDocumentMetadata(
    documentData: any,
    client: SupabaseClient = supabase
  ) {
    const { data, error } = await client
      .from('gsh_office_documents')
      .insert([documentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get a single document by ID (needed before deleting, to get storage_path)
  static async getDocument(
    documentId: string,
    client: SupabaseClient = supabase
  ) {
    const { data, error } = await client
      .from('gsh_office_documents')
      .select('*')
      .eq('id', documentId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Delete document
  static async deleteDocument(
    documentId: string,
    client: SupabaseClient = supabase
  ) {
    const { error } = await client
      .from('gsh_office_documents')
      .delete()
      .eq('id', documentId);

    if (error) throw error;
  }

  // Search documents
  static async searchDocuments(
    query: string,
    client: SupabaseClient = supabase
  ) {
    const { data, error } = await client
      .from('gsh_office_documents')
      .select('*')
      .or(`file_name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}

// ==========================================
// STORAGE OPERATIONS
// ==========================================
// These are only ever called from server-side API routes (never directly
// from browser components), so they use supabaseAdmin unconditionally -
// simpler than threading a client param through, and correct since the
// calling API route has already verified the caller by this point.

export class StorageService {
  // Upload teacher document
  static async uploadTeacherDocument(
    teacherId: string,
    category: string,
    fileBuffer: Buffer,
    originalFileName: string,
    contentType: string
  ) {
    const fileName = `${Date.now()}-${originalFileName}`;
    const path = `${teacherId}/${category}/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from(process.env.NEXT_PUBLIC_STORAGE_BUCKET_TEACHERS!)
      .upload(path, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType,
      });

    if (error) throw error;
    return { path: data.path, fileName };
  }

  // Upload office document
  static async uploadOfficeDocument(
    category: string,
    fileBuffer: Buffer,
    originalFileName: string,
    contentType: string
  ) {
    const fileName = `${Date.now()}-${originalFileName}`;
    const path = `${category}/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from(process.env.NEXT_PUBLIC_STORAGE_BUCKET_OFFICE!)
      .upload(path, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType,
      });

    if (error) throw error;
    return { path: data.path, fileName };
  }

  // Get download URL (pure URL construction, no auth needed - safe as-is)
  static getDownloadUrl(bucket: string, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  // Delete teacher document
  static async deleteTeacherDocument(path: string) {
    const { error } = await supabaseAdmin.storage
      .from(process.env.NEXT_PUBLIC_STORAGE_BUCKET_TEACHERS!)
      .remove([path]);

    if (error) throw error;
  }

  // Delete office document
  static async deleteOfficeDocument(path: string) {
    const { error } = await supabaseAdmin.storage
      .from(process.env.NEXT_PUBLIC_STORAGE_BUCKET_OFFICE!)
      .remove([path]);

    if (error) throw error;
  }
}

// ==========================================
// ACCESS LOGGING
// ==========================================

export class AccessLogService {
  static async logAccess(
    userId: string,
    documentId: string | null,
    documentType: 'teacher' | 'office',
    action: 'upload' | 'download' | 'delete' | 'view' | 'share',
    fileName: string,
    client: SupabaseClient = supabase
  ) {
    try {
      await client.from('gsh_document_access_logs').insert([
        {
          user_id: userId,
          document_id: documentId,
          document_type: documentType,
          action,
          file_name: fileName,
        },
      ]);
    } catch (error) {
      console.error('Failed to log access:', error);
    }
  }

  // Get access logs
  static async getAccessLogs(userId?: string, client: SupabaseClient = supabase) {
    let query = client.from('gsh_document_access_logs').select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('timestamp', {
      ascending: false,
    });

    if (error) throw error;
    return data;
  }
}

// ==========================================
// USER OPERATIONS
// ==========================================

export class UserService {
  // Get user by ID
  static async getUser(userId: string, client: SupabaseClient = supabase) {
    const { data, error } = await client
      .from('gsh_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Get current user
  static async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;
    return user;
  }

  // Create user profile
  static async createUserProfile(
    userId: string,
    userData: any,
    client: SupabaseClient = supabase
  ) {
    const { data, error } = await client
      .from('gsh_users')
      .insert([{ id: userId, ...userData }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update user profile
  static async updateUserProfile(
    userId: string,
    updates: any,
    client: SupabaseClient = supabase
  ) {
    const { data, error } = await client
      .from('gsh_users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// ==========================================
// AUTHENTICATION OPERATIONS
// ==========================================

export class AuthService {
  // Sign up
  static async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    return data;
  }

  // Sign in
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  // Sign out
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // Get session
  static async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;
    return session;
  }

  // Password reset
  static async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) throw error;
    return data;
  }

  // Update password
  static async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({ password });

    if (error) throw error;
    return data;
  }
}

export default supabase;
