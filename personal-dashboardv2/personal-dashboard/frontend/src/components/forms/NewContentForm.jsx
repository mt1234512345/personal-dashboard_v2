import { useState } from 'react';
import Modal from '../modals/Modal';
import { PRIORITIES, THEMES } from '../../utils/constants';

/**
 * Content creation/edit form, rendered inside a Modal.
 *
 * Props: isOpen, onClose, onSave(payload), content (existing item when
 * editing, null when creating), projectId (pre-select), projects (list).
 *
 * Note: the spec says "Title (auto-filled if possible)" -- there's no
 * backend endpoint that fetches page metadata for a URL, and doing that
 * client-side would hit CORS on most sites anyway, so title stays a plain
 * manual field. Add a metadata-scraping endpoint to the backend first if
 * you want that.
 */
export function NewContentForm({
  isOpen,
  onClose,
  onSave,
  content = null,
  projectId = null,
  projects = [],
}) {
  const isEditing = Boolean(content);

  const [url, setUrl] = useState(content?.url || '');
  const [title, setTitle] = useState(content?.title || '');
  const [priority, setPriority] = useState(content?.priority || 'Medium');
  const [selectedProjectId, setSelectedProjectId] = useState(
    content?.project_id ?? projectId ?? ''
  );
  const [theme, setTheme] = useState(content?.theme || '');
  const [thoughts, setThoughts] = useState(content?.thoughts || '');
  const [source, setSource] = useState(content?.source || '');
  const [readTime, setReadTime] = useState(content?.read_time ?? '');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  function resetAndClose() {
    setFormError(null);
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!url.trim() || !title.trim()) {
      setFormError('URL and title are both required.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      await onSave({
        url: url.trim(),
        title: title.trim(),
        source: source.trim() || null,
        read_time: readTime === '' ? null : Number(readTime),
        priority,
        theme: theme || null,
        project_id: selectedProjectId === '' ? null : Number(selectedProjectId),
        thoughts: thoughts.trim() || null,
      });
      resetAndClose();
    } catch (err) {
      setFormError(err.message || 'Could not save content. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title={isEditing ? 'Edit content' : 'New content'}>
      <form className="form" onSubmit={handleSubmit}>
        <h2 className="form-title">{isEditing ? 'Edit content' : 'New content'}</h2>

        <label className="form-field">
          <span className="form-label">URL</span>
          <input
            type="url"
            className="form-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            autoFocus
          />
        </label>

        <label className="form-field">
          <span className="form-label">Title</span>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
          />
        </label>

        <label className="form-field">
          <span className="form-label">Source (optional)</span>
          <input
            type="text"
            className="form-input"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. Cal Newport"
          />
        </label>

        <label className="form-field">
          <span className="form-label">Read time in minutes (optional)</span>
          <input
            type="number"
            min="0"
            className="form-input"
            value={readTime}
            onChange={(e) => setReadTime(e.target.value)}
          />
        </label>

        <div className="form-field">
          <span className="form-label">Priority</span>
          <div className="button-group">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                className={`pill-button ${priority === p ? 'pill-button-active' : ''}`}
                onClick={() => setPriority(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <label className="form-field">
          <span className="form-label">Project (optional)</span>
          <select
            className="form-input"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span className="form-label">Theme (optional)</span>
          <select className="form-input" value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="">No theme</option>
            {THEMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span className="form-label">My thoughts (optional)</span>
          <textarea
            className="form-input form-textarea"
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value)}
            rows={3}
          />
        </label>

        {formError && <p className="form-error">{formError}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={resetAndClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save content'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default NewContentForm;
