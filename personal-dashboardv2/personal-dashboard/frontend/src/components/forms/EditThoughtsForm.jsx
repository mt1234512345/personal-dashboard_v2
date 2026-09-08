import { useState } from 'react';

/**
 * Inline thoughts editor used inside ContentDetailModal's "Edit thoughts"
 * toggle (not its own Modal -- it's rendered directly in place of the
 * read-only thoughts display).
 *
 * Props: initialValue, onSave(thoughts) -> Promise, onCancel().
 */
export function EditThoughtsForm({ initialValue = '', onSave, onCancel }) {
  const [thoughts, setThoughts] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  async function handleSave() {
    setSaving(true);
    setFormError(null);
    try {
      await onSave(thoughts.trim());
    } catch (err) {
      setFormError(err.message || 'Could not save thoughts. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="edit-thoughts-form">
      <textarea
        className="form-input form-textarea"
        value={thoughts}
        onChange={(e) => setThoughts(e.target.value)}
        rows={4}
        autoFocus
        placeholder="What did you think?"
      />
      {formError && <p className="form-error">{formError}</p>}
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

export default EditThoughtsForm;
