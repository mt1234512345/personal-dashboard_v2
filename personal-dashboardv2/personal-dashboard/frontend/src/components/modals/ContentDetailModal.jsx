import { useState } from 'react';
import Modal from './Modal';
import EditThoughtsForm from '../forms/EditThoughtsForm';
import { priorityClass, statusDotClass, formatReadTime } from '../../utils/formatter';
import { formatDate } from '../../utils/dateUtils';

/**
 * Opens when clicking a content item. Shows full metadata + thoughts +
 * Mark unread / Archive actions.
 *
 * Props: isOpen, onClose, item, onUpdateThoughts(id, thoughts),
 * onUpdateStatus(id, status), onDelete(id).
 */
export function ContentDetailModal({ isOpen, onClose, item, onUpdateThoughts, onUpdateStatus, onDelete }) {
  const [editingThoughts, setEditingThoughts] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (!item) return null;

  function handleClose() {
    setEditingThoughts(false);
    setActionError(null);
    onClose();
  }

  async function handleMarkUnread() {
    setBusy(true);
    setActionError(null);
    try {
      await onUpdateStatus(item.id, 'Unread');
    } catch (err) {
      setActionError(err.message || 'Could not update status.');
    } finally {
      setBusy(false);
    }
  }

  async function handleArchive() {
    if (!window.confirm(`Archive "${item.title}"? This can't be undone.`)) return;
    setBusy(true);
    setActionError(null);
    try {
      await onDelete(item.id);
      handleClose();
    } catch (err) {
      setActionError(err.message || 'Could not archive this item.');
      setBusy(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={item.title}>
      <div className="content-detail">
        <div className="content-detail-header">
          <span className={`status-dot ${statusDotClass(item)}`} aria-hidden="true" />
          <h2 className="content-detail-title">{item.title}</h2>
        </div>

        <div className="content-detail-meta">
          {item.source && <span>{item.source}</span>}
          {formatReadTime(item.read_time) && <span>{formatReadTime(item.read_time)}</span>}
          <span className={`badge ${priorityClass(item.priority)}`}>{item.priority}</span>
          {item.theme && <span className="badge badge-theme">{item.theme}</span>}
          {item.created_at && <span>Added {formatDate(item.created_at)}</span>}
        </div>

        <a
          className="content-detail-link"
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open article ↗
        </a>

        <div className="content-detail-thoughts">
          <div className="content-detail-thoughts-header">
            <span className="form-label">My thoughts</span>
            {!editingThoughts && (
              <button type="button" className="btn-link" onClick={() => setEditingThoughts(true)}>
                Edit thoughts
              </button>
            )}
          </div>

          {editingThoughts ? (
            <EditThoughtsForm
              initialValue={item.thoughts || ''}
              onSave={async (thoughts) => {
                await onUpdateThoughts(item.id, thoughts);
                setEditingThoughts(false);
              }}
              onCancel={() => setEditingThoughts(false)}
            />
          ) : (
            <p className="content-detail-thoughts-text">
              {item.thoughts || 'No thoughts saved yet.'}
            </p>
          )}
        </div>

        {actionError && <p className="form-error">{actionError}</p>}

        <div className="form-actions">
          {item.status !== 'Unread' && (
            <button type="button" className="btn btn-secondary" onClick={handleMarkUnread} disabled={busy}>
              Mark unread
            </button>
          )}
          <button type="button" className="btn btn-danger" onClick={handleArchive} disabled={busy}>
            Archive
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ContentDetailModal;
