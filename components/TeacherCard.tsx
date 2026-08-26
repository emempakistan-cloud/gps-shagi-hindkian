import styles from '@/styles/TeacherCard.module.css';

interface Teacher {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  subject?: string;
  department?: string;
}

interface TeacherCardProps {
  teacher: Teacher;
  isSelected: boolean;
  onClick: () => void;
}

export default function TeacherCard({ teacher, isSelected, onClick }: TeacherCardProps) {
  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <div className={styles.avatar}>
        {teacher.full_name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()}
      </div>
      <div className={styles.info}>
        <h4>{teacher.full_name}</h4>
        <p className={styles.email}>{teacher.email}</p>
        {teacher.subject && <p className={styles.subject}>📚 {teacher.subject}</p>}
        {teacher.department && <p className={styles.department}>{teacher.department}</p>}
      </div>
    </div>
  );
}
