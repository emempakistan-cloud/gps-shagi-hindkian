import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase, TeacherService, AdminService, UserService } from '@/lib/supabase';
import Layout from '@/components/Layout';
import TeachersList from '@/components/TeachersList';
import OfficePanel from '@/components/OfficePanel';
import ManageTeachersPanel from '@/components/ManageTeachersPanel';
import NotepadPanel from '@/components/NotepadPanel';
import styles from '@/styles/Dashboard.module.css';

interface Teacher {
  id: string;
  full_name: string;
  email: string;
  subject?: string;
  department?: string;
}

interface Admin {
  id: string;
  full_name: string;
  email: string;
  position?: string;
}

interface DashboardData {
  user: any;
  teachers: Teacher[];
  admin: Admin | null;
  stats: {
    totalTeachers: number;
    totalDocuments: number;
  };
}

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'teachers' | 'office' | 'manage' | 'notepad'>('teachers');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<DashboardData>({
    user: null,
    teachers: [],
    admin: null,
    stats: { totalTeachers: 0, totalDocuments: 0 },
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Get current user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/auth');
          return;
        }

        // Get user profile
        let userProfile = await UserService.getUser(user.id);

        // Self-heal: if the auth account exists but has no matching row
        // in gsh_users (e.g. an interrupted signup), create it now.
        // Defaults to "pending" - self-healing must never bypass admin approval.
        if (!userProfile) {
          userProfile = await UserService.createUserProfile(user.id, {
            email: user.email,
            full_name: user.user_metadata?.full_name || null,
            role: 'teacher',
            status: 'pending',
          });
        }

        // Block dashboard access for accounts that aren't approved yet
        if (userProfile.status !== 'active') {
          await supabase.auth.signOut();
          router.push(`/auth?status=${userProfile.status}`);
          return;
        }

        setData((prev) => ({ ...prev, user: userProfile }));

        // Load data based on role
        if (userProfile.role === 'teacher') {
          // Load teacher's profile; self-heal if missing (e.g. signup
          // only created the gsh_users row, not a matching gsh_teachers row)
          let teacher = await TeacherService.getCurrentTeacherProfile(user.id);
          if (!teacher) {
            teacher = await TeacherService.createTeacher({
              user_id: user.id,
              full_name: userProfile.full_name || user.email,
              email: user.email,
              status: 'active',
            });
          }
          // Teacher's documents are handled by TeachersList component
        } else if (userProfile.role === 'admin') {
          // Load all teachers and admin info; self-heal admin profile if missing
          const teachers = await TeacherService.getAllTeachers();
          let admin = await AdminService.getCurrentAdminProfile(user.id);
          if (!admin) {
            admin = await AdminService.createAdminStaff({
              user_id: user.id,
              full_name: userProfile.full_name || user.email,
              email: user.email,
              status: 'active',
            });
          }
          setData((prev) => ({
            ...prev,
            teachers,
            admin,
            stats: {
              totalTeachers: teachers.length,
              totalDocuments: 0,
            },
          }));
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth');
    } catch (err: any) {
      setError('Failed to logout');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.loading}>Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
          <button onClick={() => router.push('/auth')} className={styles.button}>
            Back to Login
          </button>
        </div>
      </Layout>
    );
  }

  const isAdmin = data.user?.role === 'admin';

  return (
    <Layout userDisplayName={data.user?.full_name || data.user?.email}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1>📚 Document Management</h1>
            <p className={styles.school}>GPS Shagi Hindkian, Peshawar</p>
            <p className={styles.userInfo}>
              Welcome, <strong>{data.user?.full_name || data.user?.email}</strong>
              {isAdmin && <span className={styles.adminBadge}>Admin</span>}
            </p>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>

        {data.stats.totalTeachers > 0 && (
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Teachers</span>
              <span className={styles.statValue}>{data.stats.totalTeachers}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total Documents</span>
              <span className={styles.statValue}>{data.stats.totalDocuments}</span>
            </div>
          </div>
        )}

        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'teachers' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('teachers')}
            >
              👥 Teachers & Documents
            </button>
            {isAdmin && (
              <button
                className={`${styles.tab} ${activeTab === 'office' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('office')}
              >
                🏢 Office Management
              </button>
            )}
            {isAdmin && (
              <button
                className={`${styles.tab} ${activeTab === 'manage' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('manage')}
              >
                🛡️ Manage Teachers
              </button>
            )}
            <button
              className={`${styles.tab} ${activeTab === 'notepad' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('notepad')}
            >
              📝 My Notepad
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'teachers' && (
              <TeachersList isAdmin={isAdmin} currentUserId={data.user?.id} />
            )}
            {activeTab === 'office' && isAdmin && <OfficePanel />}
            {activeTab === 'manage' && isAdmin && <ManageTeachersPanel />}
            {activeTab === 'notepad' && <NotepadPanel />}
          </div>
        </div>
      </div>
    </Layout>
  );
}
