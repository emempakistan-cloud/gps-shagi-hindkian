import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './UploadModal.module.css';

interface UploadModalProps {
  categoryId: string;
  teacherId?: string;
  isOffice?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadModal({
  categoryId,
  teacherId,
  isOffice = false,
  onClose,
  onSuccess,
}: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = [
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];

    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      setError('File type not supported. Please use PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, or TXT.');
      setSelectedFile(null);
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('File is too large. Maximum size is 100 MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const endpoint = isOffice
        ? `/api/office/documents/upload?category=${encodeURIComponent(categoryId)}`
        : `/api/teachers/${teacherId}/documents/upload?category=${encodeURIComponent(categoryId)}`;

      // Get the current session so we can attach the auth token -
      // both upload endpoints require it.
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('You must be logged in to upload documents.');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      setUploadProgress(100);
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (err) {
      setError((err as Error).message);
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Upload Document</h2>
          <button className={styles.closeBtn} onClick={onClose} disabled={isUploading}>
            ✕
          </button>
        </div>

        <form onSubmit={handleUpload} className={styles.form}>
          <div className={styles.fileInputSection}>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className={styles.hiddenFileInput}
              accept={allowedTypes.join(',')}
              disabled={isUploading}
            />
            <button
              type="button"
              className={styles.chooseFileBtn}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              📂 Choose File
            </button>
            <p className={styles.selectedFileName}>
              {selectedFile ? selectedFile.name : 'No file selected'}
            </p>
          </div>

          <div className={styles.fileInfo}>
            <p className={styles.infoText}>
              Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, TXT
            </p>
            <p className={styles.infoText}>Maximum file size: 100 MB</p>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {isUploading && (
            <div className={styles.progressSection}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className={styles.progressText}>
                {uploadProgress < 100 ? 'Uploading...' : 'Upload complete!'}
              </p>
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
