import { useEffect, useState } from 'react';
import { OfficeDocumentService } from '@/lib/supabase';
import DocumentList from './DocumentList';
import UploadModal from './UploadModal';
import styles from '@/styles/OfficePanel.module.css';

interface Document {
  id: string;
  file_name: string;
  category: string;
  file_type?: string;
  file_size?: number;
  uploaded_at?: string;
  storage_path: string;
  description?: string;
}

const CATEGORIES = ['Finance', 'HR', 'Administration', 'Compliance', 'Other'];

export default function OfficePanel() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Finance');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    loadDocuments();
    loadStats();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await OfficeDocumentService.getDocumentsByCategory(selectedCategory);
      setDocuments(docs);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await OfficeDocumentService.getCategoryStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    try {
      setLoading(true);
      const docs = await OfficeDocumentService.getDocumentsByCategory(category);
      setDocuments(docs);
    } catch (err: any) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = async () => {
    setShowUploadModal(false);
    await loadDocuments();
    await loadStats();
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const response = await fetch(`/api/office/documents/${docId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${(await (await import('@/lib/supabase')).supabase.auth.getSession())?.data?.session?.access_token}`,
        },
      });

      if (response.ok) {
        await loadDocuments();
        await loadStats();
      } else {
        setError('Failed to delete document');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete document');
    }
  };

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.header}>
        <h3>🏢 Office Document Management</h3>
        <button className={styles.uploadBtn} onClick={() => setShowUploadModal(true)}>
          + Upload Document
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.category} className={styles.statCard}>
            <h4>{stat.category}</h4>
            <p className={styles.count}>{stat.count} documents</p>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className={styles.categories}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`${styles.categoryBtn} ${
              selectedCategory === cat ? styles.active : ''
            }`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Documents */}
      <div className={styles.documentsSection}>
        <h4>📄 {selectedCategory} Documents</h4>
        {loading ? (
          <div className={styles.loading}>Loading documents...</div>
        ) : (
          <DocumentList
            documents={documents}
            isAdmin={true}
            isOffice={true}
            onDelete={handleDeleteDocument}
          />
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          categoryId={selectedCategory}
          isOffice={true}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
