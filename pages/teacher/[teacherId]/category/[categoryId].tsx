import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import DocumentList from '@/components/DocumentList';
import UploadModal from '@/components/UploadModal';
import styles from '@/styles/Documents.module.css';

interface Document {
  id: string;
  name: string;
  size: number;
  lastModified: string;
  webUrl: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const { teacherId, categoryId } = router.query;
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [categoryName, setCategoryName] = useState<string>('');
  const [teacherName, setTeacherName] = useState<string>('');

  useEffect(() => {
    if (teacherId && categoryId && router.isReady) {
      fetchDocuments();
      // Get category and teacher names from router query
      const categoryName = router.query.categoryName as string;
      const teacherName = router.query.teacherName as string;
      if (categoryName) setCategoryName(categoryName);
      if (teacherName) setTeacherName(teacherName);
    }
  }, [teacherId, categoryId, router.isReady]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/teachers/${teacherId}/categories/${categoryId}/documents`
      );
      if (response.status === 401) {
        router.push('/');
        return;
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error fetching documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = async () => {
    await fetchDocuments();
    setShowUploadModal(false);
  };

  const handleDeleteSuccess = async () => {
    await fetchDocuments();
  };

  return (
    <Layout>
      <div className={styles.documentsContainer}>
        <div className={styles.breadcrumb}>
          <Link href="/dashboard" className={styles.breadcrumbLink}>Dashboard</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link href={`/teacher/${teacherId}`} className={styles.breadcrumbLink}>
            {teacherName || 'Teacher'}
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{categoryName || 'Category'}</span>
        </div>

        <div className={styles.header}>
          <div>
            <h2>
              {teacherName} / <span className={styles.categoryHighlight}>{categoryName}</span>
            </h2>
            <p className={styles.subtitle}>
              {documents.length} {documents.length === 1 ? 'document' : 'documents'}
            </p>
          </div>
          <button
            className={styles.uploadBtn}
            onClick={() => setShowUploadModal(true)}
          >
            📤 Upload Document
          </button>
        </div>

        {error && (
          <div className={styles.errorBox}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📄</div>
            <h3>No documents in this folder yet</h3>
            <p>Upload your first document to get started.</p>
            <button
              className={styles.emptyActionBtn}
              onClick={() => setShowUploadModal(true)}
            >
              📤 Upload Document
            </button>
          </div>
        ) : (
          <DocumentList
            documents={documents}
            categoryId={categoryId as string}
            teacherId={teacherId as string}
            onDocumentDeleted={handleDeleteSuccess}
          />
        )}
      </div>

      {showUploadModal && (
        <UploadModal
          categoryId={categoryId as string}
          teacherId={teacherId as string}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </Layout>
  );
}
