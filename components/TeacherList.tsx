import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './TeacherList.module.css';

interface Teacher {
  id: string;
  name: string;
  documentCount: number;
}

interface TeacherListProps {
  teachers: Teacher[];
  onTeacherUpdated?: () => void;
}

export default function TeacherList({ teachers, onTeacherUpdated }: TeacherListProps) {
  const router = useRouter();

  const handleTeacherClick = (teacher: Teacher) => {
    router.push({
      pathname: `/teacher/${teacher.id}`,
      query: { name: teacher.name }
    });
  };

  return (
    <div className={styles.teacherGrid}>
      {teachers.map((teacher) => (
        <div
          key={teacher.id}
          className={styles.teacherCard}
          onClick={() => handleTeacherClick(teacher)}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleTeacherClick(teacher);
            }
          }}
        >
          <div className={styles.cardHeader}>
            <div className={styles.teacherIcon}>👤</div>
            <h3 className={styles.teacherName}>{teacher.name}</h3>
          </div>
          <div className={styles.cardFooter}>
            <span className={styles.docCount}>
              📄 {teacher.documentCount}
              {teacher.documentCount === 1 ? ' document' : ' documents'}
            </span>
            <span className={styles.arrow}>→</span>
          </div>
        </div>
      ))}
    </div>
  );
}
