import { useState } from 'react';
import Modal from '../modals/Modal';
import { PROJECT_STATUSES } from '../../utils/constants';

/**
 * Project creation/edit form, rendered inside a Modal.
 * Props: isOpen, onClose, onSave(payload), project (existing when editing).
 */
export function NewProjectForm({ isOpen, onClose, onSave, project = null }) {
  const isEditing = Boolean(project);

  const [title, setTitle] = useState(project?.title || '');
  const [description, setDescription] = useState(project?.description || '');
  const [status, setStatus] = useState(project?.status || 'Active');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  function resetAndClose() {
    setFormError(null);
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Project name is required.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        status,
      });
      resetAndClose();
    } catch (err) {
      setFormError(err.message || 'Could not save project. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title={isEditing ? 'Edit project' : 'New project'}>
      <form className="form" onSubmit={handleSubmit}>
        <h2 className="form-title">{isEditing ? 'Edit project' : 'New project'}</h2>

        <label className="form-field">
          <span className="form-label">Project name</span>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q4 Planning"
            autoFocus
          />
        </label>

        <label className="form-field">
          <span className="form-label">Description (optional)</span>
          <textarea
            className="form-input form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </label>

        <div className="form-field">
          <span className="form-label">Status</span>
          <div className="button-group">
            {PROJECT_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                className={`pill-button ${status === s ? 'pill-button-active' : ''}`}
                onClick={() => setStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {formError && <p className="form-error">{formError}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={resetAndClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default NewProjectForm;
