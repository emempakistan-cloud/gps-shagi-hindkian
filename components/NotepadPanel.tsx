import React, { useEffect, useState } from 'react';
import { supabase, NotesService } from '@/lib/supabase';
import styles from '../styles/NotepadPanel.module.css';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function NotepadPanel() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await NotesService.getMyNotes();
      setNotes(data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      await fetchNotes();
    };
    init();
  }, []);

  const openNewPad = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setView('editor');
  };

  const openExistingPad = (note: Note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setView('editor');
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setError(null);
    try {
      const finalTitle = title.trim() || 'Untitled';
      if (editingId) {
        await NotesService.updateNote(editingId, finalTitle, content);
      } else {
        await NotesService.createNote(userId, finalTitle, content);
      }
      await fetchNotes();
      setView('list');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await NotesService.deleteNote(noteId);
      setShowDeleteConfirm(null);
      await fetchNotes();
      if (editingId === noteId) setView('list');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const snippet = (text: string) => {
    const clean = text.replace(/\s+/g, ' ').trim();
    return clean.length > 80 ? clean.slice(0, 80) + '…' : clean || 'Empty note';
  };

  if (loading) {
    return <div className={styles.loading}>Loading your notepad...</div>;
  }

  if (view === 'editor') {
    return (
      <div className={styles.container}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.editorHeader}>
          <button className={styles.backBtn} onClick={() => setView('list')}>
            ← Back
          </button>
          {editingId && (
            <button
              className={styles.deleteBtn}
              onClick={() => setShowDeleteConfirm(editingId)}
            >
              Delete
            </button>
          )}
        </div>

        <input
          className={styles.titleInput}
          type="text"
          placeholder="Title (e.g. Today's Schedule, Reminders, Essay Draft...)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={150}
        />

        <textarea
          className={styles.contentArea}
          placeholder="Write your schedule, reminders, notes, or anything you want to remember..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
        />

        <div className={styles.editorFooter}>
          <span className={styles.charCount}>{content.length} characters</span>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {showDeleteConfirm && (
          <div
            className={styles.confirmOverlay}
            onClick={() => setShowDeleteConfirm(null)}
          >
            <div
              className={styles.confirmDialog}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Delete this note?</h3>
              <p className={styles.confirmWarning}>
                This action cannot be undone.
              </p>
              <div className={styles.confirmActions}>
                <button
                  className={styles.confirmCancel}
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmDelete}
                  onClick={() => handleDelete(showDeleteConfirm)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>📝 My Notepad</h2>
        <button className={styles.newPadBtn} onClick={openNewPad}>
          + New Pad
        </button>
      </div>

      <p className={styles.subtitle}>
        Private to you only - schedules, reminders, notes, or writing.
      </p>

      {error && <div className={styles.error}>{error}</div>}

      {notes.length === 0 ? (
        <div className={styles.empty}>
          <p>No pads yet. Click "+ New Pad" to write your first one.</p>
        </div>
      ) : (
        <div className={styles.notesGrid}>
          {notes.map((note) => (
            <div
              key={note.id}
              className={styles.noteCard}
              onClick={() => openExistingPad(note)}
            >
              <h4 className={styles.noteTitle}>{note.title}</h4>
              <p className={styles.noteSnippet}>{snippet(note.content)}</p>
              <span className={styles.noteDate}>
                {formatDate(note.updated_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
