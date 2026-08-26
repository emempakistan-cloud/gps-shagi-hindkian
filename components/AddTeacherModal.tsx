import React, { useState } from 'react';
import styles from './AddTeacherModal.module.css';

interface AddTeacherModalProps {
  onClose: () => void;
  onSubmit: (teacherName: string) => Promise<void>;
}

export default function AddTeacherModal({ onClose, onSubmit }: AddTeacherModalProps) {
  const [teacherName, setTeacherName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!teacherName.trim()) {
      setError('Teacher name is required');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(teacherName.trim());
    } catch (err) {
      setError((err as Error).message);
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Add New Teacher</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="teacherName">Teacher Name</label>
            <input
              id="teacherName"
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="Enter teacher name"
              className={styles.input}
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
