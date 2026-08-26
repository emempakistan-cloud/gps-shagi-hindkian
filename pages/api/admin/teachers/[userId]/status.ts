import { NextApiRequest, NextApiResponse } from 'next';
import { supabase, supabaseAdmin } from '@/lib/supabase';

const VALID_STATUSES = ['pending', 'active', 'inactive', 'rejected'];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
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

    const { userId } = req.query;
    const { status } = req.body;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'User ID required' });
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    // Prevent an admin from accidentally locking themselves out
    if (userId === user.id && status !== 'active') {
      return res.status(400).json({
        error: 'You cannot change your own account out of active status.',
      });
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('gsh_users')
      .update({ status })
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (updateError) throw updateError;

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ success: true, user: updated });
  } catch (error: any) {
    console.error('Admin status update error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to update status',
    });
  }
}
