import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import styles from '@/styles/TeacherProfile.module.css';

interface Category {
  id: string;
  name: string;
  documentCount: number;
}

export default function TeacherProfilePage() {
  const router = useRouter();
  const { teacherId } = router.query;
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState<string>('');

  useEffect(() => {
    if (teacherId && typeof teacherId === 'string') {
      // Get teacher name from router query
      const name = router.query.name as string;
      if (name) {
        setTeacherName(name);
      }
      fetchTeacherDetails();
    }
  }, [teacherId, router.isReady]);

  const fetchTeacherDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/teachers/${teacherId}`);
      if (response.status === 401) {
        router.push('/');
        return;
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch teacher details');
      }
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error fetching teacher details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const categoryIcons: { [key: string]: string } = {
    Personal: '👤',
    Education: '🎓',
    Employment: '💼',
    Training: '📚',
    Other: '📋',
  };

  return (
    <Layout>
      <div className={styles.profileContainer}>
        <div className={styles.backNavigation}>
          <Link href="/dashboard" className={styles.backLink}>
            ← Back to Teachers
          </Link>
        </div>

        <div className={styles.profileHeader}>
          <div className={styles.profileTitle}>
            <h1>{teacherName || 'Teacher'}</h1>
            <p className={styles.totalDocs}>
              {categories.reduce((sum, cat) => sum + cat.documentCount, 0)} total documents
            </p>
          </div>
        </div>

        {error && (
          <div className={styles.errorBox}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📁</div>
            <h3>No categories found</h3>
            <p>This teacher folder is empty or couldn't be accessed.</p>
          </div>
        ) : (
          <div className={styles.categoriesGrid}>
            {categories.map((category) => (
              <div
                key={category.id}
                className={styles.categoryCard}
                onClick={() => {
                  router.push({
                    pathname: `/teacher/${teacherId}/category/${category.id}`,
                    query: {
                      categoryName: category.name,
                      teacherName: teacherName
                    }
                  });
                }}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    router.push({
                      pathname: `/teacher/${teacherId}/category/${category.id}`,
                      query: {
                        categoryName: category.name,
                        teacherName: teacherName
                      }
                    });
                  }
                }}
              >
                <div className={styles.categoryIcon}>
                  {categoryIcons[category.name] || '📁'}
                </div>
                <div className={styles.categoryInfo}>
                  <h3 className={styles.categoryName}>{category.name}</h3>
                  <p className={styles.categoryCount}>
                    {category.documentCount}
                    {category.documentCount === 1 ? ' document' : ' documents'}
                  </p>
                </div>
                <span className={styles.categoryArrow}>→</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
