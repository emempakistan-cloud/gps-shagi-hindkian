import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
  userDisplayName?: string;
}

export default function Layout({ children, userDisplayName }: LayoutProps) {
  const router = useRouter();
  const isAuthPage = router.pathname === '/';

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    await supabase.auth.signOut();
    router.push('/auth?tab=login');
  };

  return (
    <div className={styles.container}>
      {!isAuthPage && (
        <nav className={styles.navbar}>
          <div className={styles.navContent}>
            <Link href="/dashboard" className={styles.logo}>
              📁 School Teacher Document Archive
            </Link>
            <div className={styles.navRight}>
              {userDisplayName && <span className={styles.userName}>{userDisplayName}</span>}
              <a href="#" onClick={handleSignOut} className={styles.signOutBtn}>
                Sign Out
              </a>
            </div>
          </div>
        </nav>
      )}

      <main className={isAuthPage ? styles.authMain : styles.appMain}>
        {children}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>&copy; 2026 School Teacher Document Archive. All rights reserved.</p>
          <p className={styles.credits}>
            Designed and developed by:{' '}
            <a
              href="https://ememstore.vercel.app/#/product?id=c1ca5253-8579-4211-ace0-0d9b76c22e37"
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>Jamal Abdul Nasir</strong>
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
