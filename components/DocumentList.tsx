import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './DocumentList.module.css';

interface Document {
  id: string;
  file_name: string;
  file_size?: number;
  file_type?: string;
  storage_path: string;
  uploaded_at?: string;
  description?: string;
}

interface DocumentListProps {
  documents: Document[];
  isAdmin: boolean;
  isOffice?: boolean;
  onDelete: (documentId: string) => void;
}

export default function DocumentList({
  documents,
  isAdmin,
  isOffice = false,
  onDelete,
}: DocumentListProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Unknown date';
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const icons: { [key: string]: string } = {
      pdf: '📕',
      doc: '📄',
      docx: '📄',
      xls: '📊',
      xlsx: '📊',
      ppt: '📈',
      pptx: '📈',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      txt: '📝',
    };
    return icons[ext || ''] || '📎';
  };

  // Downloads now go through a secure API route rather than a public
  // storage URL: it verifies who's asking, checks they actually own the
  // document (or are an admin), then issues a short-lived (60s) signed
  // URL. The bucket itself is private, so no other URL would work.
  const handleDownload = async (doc: Document) => {
    setDownloadError(null);
    setDownloadingId(doc.id);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error('Not logged in');

      const type = isOffice ? 'office' : 'teacher';
      const response = await fetch(
        `/api/documents/download?documentId=${doc.id}&type=${type}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to download document');
      }

      const { url } = await response.json();
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setDownloadError((err as Error).message);
    } finally {
      setDownloadingId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No documents in this category yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.documentList}>
      {downloadError && (
        <div className={styles.errorBanner}>{downloadError}</div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>File Name</th>
              <th className={styles.sizeCol}>Size</th>
              <th className={styles.dateCol}>Uploaded</th>
              <th className={styles.actionsCol}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className={styles.documentRow}>
                <td className={styles.nameCell}>
                  <span className={styles.fileIcon}>{getFileIcon(doc.file_name)}</span>
                  <span className={styles.fileName} title={doc.file_name}>
                    {doc.file_name}
                  </span>
                </td>
                <td className={styles.sizeCol}>{formatFileSize(doc.file_size)}</td>
                <td className={styles.dateCol}>{formatDate(doc.uploaded_at)}</td>
                <td className={styles.actionsCol}>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleDownload(doc)}
                      disabled={downloadingId === doc.id}
                      title="Download document"
                    >
                      {downloadingId === doc.id ? 'Preparing...' : 'Download'}
                    </button>
                    {isAdmin && (
                      <button
                        className={styles.deleteBtn}
                        onClick={() => setShowDeleteConfirm(doc.id)}
                        title="Delete document"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          className={styles.confirmOverlay}
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            className={styles.confirmDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Delete Document?</h3>
            <p>
              Are you sure you want to delete:
              <br />
              <strong>
                {documents.find((d) => d.id === showDeleteConfirm)?.file_name}
              </strong>
            </p>
            <p className={styles.confirmWarning}>
              This action cannot be undone.
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.confirmCancel}
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className={styles.confirmDelete}
                onClick={() => {
                  onDelete(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
