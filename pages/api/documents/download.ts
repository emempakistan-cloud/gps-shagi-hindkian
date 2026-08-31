import { NextApiRequest, NextApiResponse } from 'next';
import {
  supabase,
  supabaseAdmin,
  TeacherDocumentService,
  OfficeDocumentService,
  TeacherService,
} from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { documentId, type } = req.query;

    if (!documentId || typeof documentId !== 'string') {
      return res.status(400).json({ error: 'Document ID required' });
    }

    if (type !== 'teacher' && type !== 'office') {
      return res.status(400).json({ error: 'type must be "teacher" or "office"' });
    }

    // Look up the caller's role (needed for authorization + office access)
    const { data: callerProfile } = await supabaseAdmin
      .from('gsh_users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const isAdmin = callerProfile?.role === 'admin';

    let storagePath: string;
    let bucket: string;

    if (type === 'teacher') {
      const document = await TeacherDocumentService.getDocument(
        documentId,
        supabaseAdmin
      );
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Only the owning teacher, or an admin (except for "Private"
      // category documents, which are visible to the owning teacher only,
      // enforced here explicitly since supabaseAdmin bypasses RLS)
      const teacher = await TeacherService.getTeacher(
        document.teacher_id,
        supabaseAdmin
      );
      const isOwner = teacher?.user_id === user.id;
      const canAccess = isOwner || (isAdmin && document.category !== 'Private');

      if (!canAccess) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      storagePath = document.storage_path;
      bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET_TEACHERS!;
    } else {
      // Office documents - admin only
      if (!isAdmin) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const document = await OfficeDocumentService.getDocument(
        documentId,
        supabaseAdmin
      );
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      storagePath = document.storage_path;
      bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET_OFFICE!;
    }

    // Generate a short-lived signed URL - works regardless of whether the
    // bucket is public or private, and the bucket name is always read
    // fresh here server-side (no client-side env var timing issues).
    const { data: signedUrlData, error: signError } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(storagePath, 60); // valid for 60 seconds

    if (signError || !signedUrlData) {
      console.error('Signed URL error:', signError);
      return res.status(500).json({
        error: signError?.message || 'Failed to generate download link',
      });
    }

    return res.status(200).json({ url: signedUrlData.signedUrl });
  } catch (error: any) {
    console.error('Download API error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate download link',
    });
  }
}
