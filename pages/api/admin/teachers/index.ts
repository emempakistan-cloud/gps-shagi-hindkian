import { NextApiRequest, NextApiResponse } from 'next';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify caller is an authenticated admin
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

    const { data: callerProfile } = await supabaseAdmin
      .from('gsh_users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (callerProfile?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Fetch every user account (teacher + admin signups), newest first
    const { data: users, error: usersError } = await supabaseAdmin
      .from('gsh_users')
      .select('id, email, full_name, role, status, created_at')
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;

    // Fetch matching gsh_teachers rows (for phone/subject/department, if set)
    const { data: teacherRows } = await supabaseAdmin
      .from('gsh_teachers')
      .select('id, user_id, subject, department, phone');

    // Fetch document counts grouped by teacher_id
    const { data: docRows } = await supabaseAdmin
      .from('gsh_teacher_documents')
      .select('teacher_id');

    const docCountByTeacherId: Record<string, number> = {};
    (docRows || []).forEach((d) => {
      docCountByTeacherId[d.teacher_id] =
        (docCountByTeacherId[d.teacher_id] || 0) + 1;
    });

    const teacherByUserId: Record<string, any> = {};
    (teacherRows || []).forEach((t) => {
      teacherByUserId[t.user_id] = t;
    });

    const result = (users || []).map((u) => {
      const teacherRow = teacherByUserId[u.id];
      return {
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        status: u.status,
        created_at: u.created_at,
        subject: teacherRow?.subject || null,
        department: teacherRow?.department || null,
        phone: teacherRow?.phone || null,
        document_count: teacherRow ? docCountByTeacherId[teacherRow.id] || 0 : 0,
      };
    });

    return res.status(200).json({ users: result });
  } catch (error: any) {
    console.error('Admin teachers list error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to load teachers',
    });
  }
}
