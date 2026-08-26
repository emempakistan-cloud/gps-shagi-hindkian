import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from '../styles/ManageTeachersPanel.module.css';

interface TeacherRow {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: string;
  created_at: string;
  subject: string | null;
  department: string | null;
  phone: string | null;
  document_count: number;
}

export default function ManageTeachersPanel() {
  const [users, setUsers] = useState<TeacherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'rejected' | 'inactive'>('all');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error('Not logged in');

      const response = await fetch('/api/admin/teachers', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to load teachers');
      }

      const result = await response.json();
      setUsers(result.users);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateStatus = async (userId: string, status: string) => {
    setActionLoadingId(userId);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error('Not logged in');

      const response = await fetch(`/api/admin/teachers/${userId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to update status');
      }

      await fetchUsers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers =
    filter === 'all' ? users : users.filter((u) => u.status === filter);

  const pendingCount = users.filter((u) => u.status === 'pending').length;

  if (loading) {
    return <div className={styles.loading}>Loading teachers...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>
          👥 Manage Teachers
          {pendingCount > 0 && (
            <span className={styles.pendingBadge}>{pendingCount} pending</span>
          )}
        </h2>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.filters}>
        {(['all', 'pending', 'active', 'rejected', 'inactive'] as const).map(
          (f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.activeFilter : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && (
                <span className={styles.count}>
                  {' '}
                  ({users.filter((u) => u.status === f).length})
                </span>
              )}
            </button>
          )
        )}
      </div>

      <div className={styles.tableWrapper}>
        {filteredUsers.length === 0 ? (
          <div className={styles.empty}>No accounts in this category.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Documents</th>
                <th>Signed Up</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.full_name || '—'}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[u.status]}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>{u.document_count}</td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className={styles.actions}>
                    {u.status === 'pending' && (
                      <>
                        <button
                          className={styles.approveBtn}
                          disabled={actionLoadingId === u.id}
                          onClick={() => updateStatus(u.id, 'active')}
                        >
                          ✓ Approve
                        </button>
                        <button
                          className={styles.rejectBtn}
                          disabled={actionLoadingId === u.id}
                          onClick={() => updateStatus(u.id, 'rejected')}
                        >
                          ✕ Reject
                        </button>
                      </>
                    )}
                    {u.status === 'active' && u.role !== 'admin' && (
                      <button
                        className={styles.deactivateBtn}
                        disabled={actionLoadingId === u.id}
                        onClick={() => updateStatus(u.id, 'inactive')}
                      >
                        Deactivate
                      </button>
                    )}
                    {(u.status === 'rejected' || u.status === 'inactive') && (
                      <button
                        className={styles.approveBtn}
                        disabled={actionLoadingId === u.id}
                        onClick={() => updateStatus(u.id, 'active')}
                      >
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
