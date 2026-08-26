import { NextApiRequest, NextApiResponse } from 'next';
import { GraphClient } from '../../../lib/graph';
import { getTokenFromRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { accessToken, refreshToken } = getTokenFromRequest(req);

    if (!accessToken || !refreshToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const graphClient = new GraphClient(accessToken, refreshToken);

    if (req.method === 'GET') {
      // Get office categories/folders
      const archiveFolder = await graphClient.findOrCreateArchiveFolder();
      if (!archiveFolder) {
        return res.status(500).json({ error: 'Failed to access archive folder' });
      }

      // Get or create "Office" folder
      const officeFolder = await graphClient.getOrCreateOfficeFolder(archiveFolder.id);
      if (!officeFolder) {
        return res.status(500).json({ error: 'Failed to access office folder' });
      }

      // Get categories in office folder
      const categories = await graphClient.getOfficeCategoryFolders(officeFolder.id);

      return res.status(200).json({
        officeFolder: officeFolder,
        categories: categories || [],
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Office API error:', error);
    return res.status(500).json({ error: 'Failed to process office request' });
  }
}
