import { NextApiRequest, NextApiResponse } from 'next';
import { GraphClient } from '../../../../lib/graph';
import { getTokenFromRequest } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { accessToken, refreshToken } = getTokenFromRequest(req);

    if (!accessToken || !refreshToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { documentId } = req.query;

    if (!documentId || typeof documentId !== 'string') {
      return res.status(400).json({ error: 'Document ID required' });
    }

    const graphClient = new GraphClient(accessToken, refreshToken);

    if (req.method === 'DELETE') {
      await graphClient.deleteFile(documentId);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Delete office document error:', error);
    return res.status(500).json({ error: 'Failed to delete document' });
  }
}
