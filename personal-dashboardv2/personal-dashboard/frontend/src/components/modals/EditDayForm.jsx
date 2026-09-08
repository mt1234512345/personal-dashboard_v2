import { useState } from 'react';
import Modal from './Modal';
import { THEMES } from '../../utils/constants';

/**
 * Modal form for editing a single weekly-planning day.
 * Props: isOpen, onClose, day ({ day_of_week, theme, quote, reading }),
 * onSave(dayOfWeek, data) -> Promise.
 */
export function EditDayForm({ isOpen, onClose, day, onSave }) {
  const [theme, setTheme] = useState(day?.theme || '');
  const [quote, setQuote] = useState(day?.quote || '');
  const [readingTitle, setReadingTitle] = useState(day?.reading?.title || '');
  const [readingSource, setReadingSource] = useState(day?.reading?.source || '');
  const [readingUrl, setReadingUrl] = useState(day?.reading?.url || '');
  const [readingTime, setReadingTime] = useState(day?.reading?.read_time ?? '');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  if (!day) return null;

  function resetAndClose() {
    setFormError(null);
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await onSave(day.day_of_week, {
        theme: theme || null,
        quote: quote.trim() || null,
        reading_title: readingTitle.trim() || null,
        reading_source: readingSource.trim() || null,
        reading_url: readingUrl.trim() || null,
        reading_time: readingTime === '' ? null : Number(readingTime),
      });
      resetAndClose();
    } catch (err) {
      setFormError(err.message || 'Could not save this day. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title={`Edit ${day.day_of_week}`}>
      <form className="form" onSubmit={handleSubmit}>
        <h2 className="form-title">Edit {day.day_of_week}</h2>

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
          <span className="form-label">Quote (optional)</span>
          <textarea
            className="form-input form-textarea"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            rows={2}
          />
        </label>

        <fieldset className="form-fieldset">
          <legend className="form-label">Reading (optional)</legend>

          <label className="form-field">
            <span className="form-label">Title</span>
            <input
              type="text"
              className="form-input"
              value={readingTitle}
              onChange={(e) => setReadingTitle(e.target.value)}
            />
          </label>

          <label className="form-field">
            <span className="form-label">Source</span>
            <input
              type="text"
              className="form-input"
              value={readingSource}
              onChange={(e) => setReadingSource(e.target.value)}
            />
          </label>

          <label className="form-field">
            <span className="form-label">URL</span>
            <input
              type="url"
              className="form-input"
              value={readingUrl}
              onChange={(e) => setReadingUrl(e.target.value)}
              placeholder="https://..."
            />
          </label>

          <label className="form-field">
            <span className="form-label">Read time in minutes</span>
            <input
              type="number"
              min="0"
              className="form-input"
              value={readingTime}
              onChange={(e) => setReadingTime(e.target.value)}
            />
          </label>
        </fieldset>

        {formError && <p className="form-error">{formError}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={resetAndClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default EditDayForm;
