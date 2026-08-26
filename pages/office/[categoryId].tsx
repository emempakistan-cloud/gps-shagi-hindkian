import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import DocumentList from '../../components/DocumentList';
import UploadModal from '../../components/UploadModal';
import styles from '../../styles/Documents.module.css';

export default function OfficeDocuments() {
  const router = useRouter();
  const { categoryId, categoryName } = router.query;
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!categoryId) return;
    fetchDocuments();
  }, [categoryId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/office/documents?categoryId=${categoryId}`);
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      setError('Failed to load documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    fetchDocuments();
    setShowUpload(false);
  };

  if (!router.isReady) return <Layout><p>Loading...</p></Layout>;

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <button onClick={() => router.push('/dashboard')}>Dashboard</button>
          <span> / </span>
          <button onClick={() => router.push('/office')}>Office</button>
          <span> / </span>
          <span>{categoryName}</span>
        </div>

        <div className={styles.header}>
          <div>
            <h1>📁 {categoryName}</h1>
            <p>Office & Administration Documents</p>
          </div>
          <button 
            className={styles.uploadBtn}
            onClick={() => setShowUpload(true)}
          >
            📤 Upload Document
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {loading ? (
          <p>Loading documents...</p>
        ) : (
          <DocumentList 
            documents={documents}
            categoryId={categoryId as string}
            isOffice={true}
            onDelete={fetchDocuments}
          />
        )}

        {showUpload && (
          <UploadModal
            categoryId={categoryId as string}
            isOffice={true}
            onClose={() => setShowUpload(false)}
            onSuccess={handleUploadSuccess}
          />
        )}
      </div>
    </Layout>
  );
}
