import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs/promises';
import {
  supabase,
  supabaseAdmin,
  StorageService,
  TeacherDocumentService,
  AccessLogService,
  TeacherService,
} from '@/lib/supabase';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'text/plain',
];

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

    // Verify token with Supabase
    const { data } = await supabase.auth.getUser(token);
    if (!data.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = data.user.id;

    // Only approved (active) accounts may upload - blocks pending/rejected
    // accounts even if they still hold a valid session token. Uses
    // supabaseAdmin since the anon client has no session context
    // server-side and would incorrectly find 0 rows, even for the
    // caller's own row.
    const { data: userRow } = await supabaseAdmin
      .from('gsh_users')
      .select('status')
      .eq('id', userId)
      .maybeSingle();

    if (userRow?.status !== 'active') {
      return res.status(403).json({
        error: 'Your account is not yet approved by an admin.',
      });
    }

    if (req.method === 'GET') {
      // Get teacher documents
      const { teacherId, category } = req.query;

      if (!teacherId || typeof teacherId !== 'string') {
        return res.status(400).json({ error: 'Teacher ID required' });
      }

      // Verify teacher belongs to user
      const teacher = await TeacherService.getTeacher(teacherId, supabaseAdmin);
      if (!teacher || teacher.user_id !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      let documents;
      if (category && typeof category === 'string') {
        documents = await TeacherDocumentService.getDocumentsByCategory(
          teacherId,
          category,
          supabaseAdmin
        );
      } else {
        documents = await TeacherDocumentService.getTeacherDocuments(
          teacherId,
          supabaseAdmin
        );
      }

      return res.status(200).json({ documents });
    }

    if (req.method === 'POST') {
      // Upload document
      const { teacherId, category } = req.query;

      if (!teacherId || typeof teacherId !== 'string') {
        return res.status(400).json({ error: 'Teacher ID required' });
      }

      if (!category || typeof category !== 'string') {
        return res.status(400).json({ error: 'Category required' });
      }

      // Verify teacher belongs to user
      const teacher = await TeacherService.getTeacher(teacherId, supabaseAdmin);
      if (!teacher || teacher.user_id !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Parse form data - use the callback API explicitly, which is
      // stable across all formidable versions (avoids relying on
      // version-specific Promise-returning behavior of .parse()).
      const form = new formidable.IncomingForm({
        maxFileSize: 100 * 1024 * 1024, // 100MB
      });

      const { fields, files } = await new Promise<{ fields: any; files: any }>(
        (resolve, reject) => {
          form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
          });
        }
      );

      // formidable returns a single object per field by default
      // (only an array if `multiples: true` is set) - handle both
      // shapes defensively rather than assuming one or the other.
      const fileField = files.file;
      const file = Array.isArray(fileField) ? fileField[0] : fileField;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Validate file type
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype || '')) {
        return res.status(400).json({
          error: 'File type not allowed. Use PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, or TXT.',
        });
      }

      // Read file from disk
      const fileContent = await fs.readFile(file.filepath);

      // Upload to Supabase Storage
      const { path, fileName } = await StorageService.uploadTeacherDocument(
        teacherId,
        category,
        fileContent,
        file.originalFilename || 'file',
        file.mimetype || 'application/octet-stream'
      );

      // Add metadata to database
      const document = await TeacherDocumentService.addDocumentMetadata(
        {
          teacher_id: teacherId,
          category: category,
          file_name: file.originalFilename,
          file_size: file.size,
          file_type: file.mimetype,
          storage_path: path,
          uploaded_by: userId,
          description: (Array.isArray(fields.description)
            ? fields.description[0]
            : fields.description) || null,
        },
        supabaseAdmin
      );

      // Log access
      await AccessLogService.logAccess(
        userId,
        document.id,
        'teacher',
        'upload',
        file.originalFilename || 'Unknown',
        supabaseAdmin
      );

      // Clean up temp file
      await fs.unlink(file.filepath);

      return res.status(201).json({
        success: true,
        document: {
          id: document.id,
          name: document.file_name,
          size: document.file_size,
          type: document.file_type,
          uploadedAt: document.uploaded_at,
        },
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process request',
    });
  }
}
