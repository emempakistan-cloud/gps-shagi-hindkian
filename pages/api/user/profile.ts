import { NextApiRequest, NextApiResponse } from 'next';
import { supabase, supabaseAdmin, UserService } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract the access token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate the token and get the authenticated user (identity check -
    // anon client is fine here, it doesn't touch RLS-protected tables)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch the full profile row (role, full_name, status, etc.) - use
    // supabaseAdmin since the anon client has no session context
    // server-side and would incorrectly find 0 rows, even for the
    // caller's own row.
    let profile = await UserService.getUser(user.id, supabaseAdmin);

    // Self-heal: if the auth account exists but has no matching row in
    // gsh_users (can happen if a previous signup attempt failed partway
    // through), create it now. Defaults to "pending" - self-healing must
    // never bypass admin approval.
    if (!profile) {
      profile = await UserService.createUserProfile(
        user.id,
        {
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          role: 'teacher',
          status: 'pending',
        },
        supabaseAdmin
      );
    }

    return res.status(200).json({
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || null,
      role: profile?.role || 'teacher',
      status: profile?.status || 'pending',
    });
  } catch (error: any) {
    console.error('Profile API error:', error);
    const message = error.message || 'Failed to fetch profile';
    return res.status(500).json({ error: message });
  }
}
