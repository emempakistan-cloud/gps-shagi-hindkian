import { useEffect, useState } from 'react';
import { TeacherService, TeacherDocumentService } from '@/lib/supabase';
import TeacherCard from './TeacherCard';
import DocumentList from './DocumentList';
import UploadModal from './UploadModal';
import styles from '@/styles/TeachersList.module.css';

interface Teacher {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  subject?: string;
  department?: string;
}

interface TeachersListProps {
  isAdmin: boolean;
  currentUserId: string;
}

export default function TeachersList({ isAdmin, currentUserId }: TeachersListProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [documents, setDocuments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const CATEGORIES = ['Personal', 'Education', 'Employment', 'Training', 'Other'];

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const data = await TeacherService.getAllTeachers();
      setTeachers(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeacher = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setSelectedCategory(null);
    await loadTeacherDocuments(teacher.id);
  };

  const loadTeacherDocuments = async (teacherId: string) => {
    try {
      const docs = await TeacherDocumentService.getTeacherDocuments(teacherId);
      setDocuments(docs);
    } catch (err: any) {
      setError(err.message || 'Failed to load documents');
    }
  };

  const handleSelectCategory = async (category: string) => {
    if (!selectedTeacher) return;
    setSelectedCategory(category);
    try {
      const docs = await TeacherDocumentService.getDocumentsByCategory(
        selectedTeacher.id,
        category
      );
      setDocuments(docs);
    } catch (err: any) {
      setError(err.message || 'Failed to load documents');
    }
  };

  const handleUploadSuccess = async () => {
    setShowUploadModal(false);
    if (selectedTeacher) {
      await loadTeacherDocuments(selectedTeacher.id);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!selectedTeacher) return;
    try {
      const response = await fetch(
        `/api/teachers/${selectedTeacher.id}/documents/${docId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${(await (await import('@/lib/supabase')).supabase.auth.getSession())?.data?.session?.access_token}`,
          },
        }
      );

      if (response.ok) {
        await loadTeacherDocuments(selectedTeacher.id);
      } else {
        setError('Failed to delete document');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete document');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading teachers...</div>;
  }

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.grid}>
        {/* Teachers List */}
        <div className={styles.teachersPanel}>
          <h3>👥 Teachers ({teachers.length})</h3>
          <div className={styles.teachersList}>
            {teachers.length === 0 ? (
              <p className={styles.empty}>No teachers found</p>
            ) : (
              teachers.map((teacher) => (
                <TeacherCard
                  key={teacher.id}
                  teacher={teacher}
                  isSelected={selectedTeacher?.id === teacher.id}
                  onClick={() => handleSelectTeacher(teacher)}
                />
              ))
            )}
          </div>
        </div>

        {/* Documents Panel */}
        <div className={styles.documentsPanel}>
          {selectedTeacher ? (
            <>
              <div className={styles.panelHeader}>
                <h3>📄 {selectedTeacher.full_name}'s Documents</h3>
                {isAdmin || currentUserId === selectedTeacher.user_id ? (
                  <button
                    className={styles.uploadBtn}
                    onClick={() => setShowUploadModal(true)}
                  >
                    + Upload
                  </button>
                ) : null}
              </div>

              <div className={styles.categories}>
                <button
                  className={`${styles.categoryBtn} ${!selectedCategory ? styles.active : ''}`}
                  onClick={() => {
                    setSelectedCategory(null);
                    loadTeacherDocuments(selectedTeacher.id);
                  }}
                >
                  All Categories
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.categoryBtn} ${
                      selectedCategory === cat ? styles.active : ''
                    }`}
                    onClick={() => handleSelectCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <DocumentList
                documents={documents}
                isAdmin={isAdmin || currentUserId === selectedTeacher.user_id}
                onDelete={handleDeleteDocument}
              />

              {showUploadModal && (
                <UploadModal
                  teacherId={selectedTeacher.id}
                  categoryId={selectedCategory || 'Personal'}
                  isOffice={false}
                  onClose={() => setShowUploadModal(false)}
                  onSuccess={handleUploadSuccess}
                />
              )}
            </>
          ) : (
            <div className={styles.noSelection}>
              <p>👈 Select a teacher to view documents</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
