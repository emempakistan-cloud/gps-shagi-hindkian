import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { GraphClient } from '../../../lib/graph';
import { getTokenFromRequest } from '../../../lib/auth';
import fs from 'fs/promises';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { accessToken, refreshToken } = getTokenFromRequest(req);

    if (!accessToken || !refreshToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { categoryId } = req.query;

    if (!categoryId || typeof categoryId !== 'string') {
      return res.status(400).json({ error: 'Category ID required' });
    }

    const graphClient = new GraphClient(accessToken, refreshToken);

    if (req.method === 'GET') {
      // List documents in category
      const documents = await graphClient.listDocuments(categoryId);
      return res.status(200).json({ documents: documents || [] });
    }

    if (req.method === 'POST') {
      // Upload document
      const form = new formidable.IncomingForm({
        maxFileSize: 100 * 1024 * 1024, // 100MB
      });

      const [fields, files] = await form.parse(req);
      const file = files.file?.[0];

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (!ALLOWED_MIME_TYPES.includes(file.mimetype || '')) {
        return res.status(400).json({ error: 'File type not allowed' });
      }

      const fileContent = await fs.readFile(file.filepath);
      const fileName = file.originalFilename || 'document';

      const uploadSession = await graphClient.createUploadSession(categoryId, fileName);
      if (!uploadSession) {
        return res.status(500).json({ error: 'Failed to create upload session' });
      }

      // Upload to OneDrive
      const uploadResult = await fetch(uploadSession.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.mimetype || 'application/octet-stream',
        },
        body: fileContent,
      });

      if (!uploadResult.ok) {
        return res.status(500).json({ error: 'Upload failed' });
      }

      const result = await uploadResult.json();

      // Clean up temp file
      await fs.unlink(file.filepath);

      return res.status(201).json({
        success: true,
        file: {
          id: result.id,
          name: result.name,
          size: result.size,
          createdDateTime: result.createdDateTime,
        },
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Office documents API error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}
