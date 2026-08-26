import { NextApiRequest, NextApiResponse } from 'next';
import {
  supabase,
  supabaseAdmin,
  StorageService,
  TeacherDocumentService,
  TeacherService,
  AccessLogService,
} from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Check authentication
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token with Supabase (identity check - anon client is fine here)
    const { data } = await supabase.auth.getUser(token);
    if (!data.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = data.user.id;

    if (req.method === 'DELETE') {
      const { documentId } = req.query;

      if (!documentId || typeof documentId !== 'string') {
        return res.status(400).json({ error: 'Document ID required' });
      }

      // Get document details - use supabaseAdmin, the anon client has no
      // session context server-side and would incorrectly find 0 rows
      const document = await TeacherDocumentService.getDocument(
        documentId,
        supabaseAdmin
      );

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Verify authorization - only owner or admin can delete
      const { data: userData } = await supabaseAdmin
        .from('gsh_users')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      const teacher = await TeacherService.getTeacher(
        document.teacher_id,
        supabaseAdmin
      );

      if (teacher?.user_id !== userId && userData?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Delete from storage
      await StorageService.deleteTeacherDocument(document.storage_path);

      // Delete metadata from database
      await TeacherDocumentService.deleteDocument(documentId, supabaseAdmin);

      // Log access
      await AccessLogService.logAccess(
        userId,
        documentId,
        'teacher',
        'delete',
        document.file_name,
        supabaseAdmin
      );

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Delete error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to delete document',
    });
  }
}
