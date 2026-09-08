import { useState } from 'react';
import Modal from '../modals/Modal';
import { PRIORITIES, THEMES, DUE_DATE_BUCKETS } from '../../utils/constants';

/**
 * Task creation/edit form, rendered inside a Modal.
 *
 * Props:
 *   isOpen, onClose
 *   onSave(payload) -> Promise   (parent wires this to createTask/updateTask)
 *   task            -> existing task object when editing, null when creating
 *   projectId       -> pre-selected project id (e.g. opened from ProjectDetailPage)
 *   projects        -> array of { id, title } for the project dropdown
 */
export function NewTaskForm({ isOpen, onClose, onSave, task = null, projectId = null, projects = [] }) {
  const isEditing = Boolean(task);

  const [title, setTitle] = useState(task?.title || '');
  const [dueDateType, setDueDateType] = useState(task?.due_date_type || 'Today');
  const [dueDate, setDueDate] = useState(task?.due_date_type === 'Specific' ? task?.due_date || '' : '');
  const [priority, setPriority] = useState(task?.priority || 'Medium');
  const [selectedProjectId, setSelectedProjectId] = useState(
    task?.project_id ?? projectId ?? ''
  );
  const [theme, setTheme] = useState(task?.theme || '');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  function resetAndClose() {
    setFormError(null);
    onClose();
  }

  function handleQuickDueDate(bucket) {
    setDueDateType(bucket);
    setDueDate('');
  }

  function handlePickDate(value) {
    setDueDate(value);
    setDueDateType(value ? 'Specific' : 'Today');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Task name is required.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      await onSave({
        title: title.trim(),
        due_date_type: dueDateType,
        due_date: dueDateType === 'Specific' ? dueDate || null : null,
        priority,
        theme: theme || null,
        project_id: selectedProjectId === '' ? null : Number(selectedProjectId),
      });
      resetAndClose();
    } catch (err) {
      setFormError(err.message || 'Could not save task. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title={isEditing ? 'Edit task' : 'New task'}>
      <form className="form" onSubmit={handleSubmit}>
        <h2 className="form-title">{isEditing ? 'Edit task' : 'New task'}</h2>

        <label className="form-field">
          <span className="form-label">Task name</span>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs doing?"
            autoFocus
          />
        </label>

        <div className="form-field">
          <span className="form-label">Due date</span>
          <div className="button-group">
            {DUE_DATE_BUCKETS.map((bucket) => (
              <button
                key={bucket}
                type="button"
                className={`pill-button ${dueDateType === bucket ? 'pill-button-active' : ''}`}
                onClick={() => handleQuickDueDate(bucket)}
              >
                {bucket}
              </button>
            ))}
          </div>
          <input
            type="date"
            className="form-input"
            value={dueDate}
            onChange={(e) => handlePickDate(e.target.value)}
          />
        </div>

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

        {formError && <p className="form-error">{formError}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={resetAndClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default NewTaskForm;
