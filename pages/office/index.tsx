import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import styles from '../../styles/Office.module.css';

interface Category {
  id: string;
  name: string;
  documentCount: number;
}

export default function OfficePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/office');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err) {
      setError('Failed to load office categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    router.push({
      pathname: '/office/[categoryId]',
      query: { categoryId, categoryName },
    });
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <button onClick={() => router.push('/dashboard')}>Dashboard</button>
          <span> / </span>
          <span>Office & Administration</span>
        </div>

        <div className={styles.header}>
          <h1>🏢 Office & Administration</h1>
          <p>Manage school administrative documents and files</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {loading ? (
          <p>Loading office categories...</p>
        ) : (
          <div className={styles.grid}>
            {categories.map((category) => (
              <div 
                key={category.id}
                className={styles.card}
                onClick={() => handleCategoryClick(category.id, category.name)}
              >
                <div className={styles.cardIcon}>📑</div>
                <h2>{category.name}</h2>
                <p>{category.documentCount} document{category.documentCount !== 1 ? 's' : ''}</p>
                <button className={styles.cardButton}>
                  View Documents →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
