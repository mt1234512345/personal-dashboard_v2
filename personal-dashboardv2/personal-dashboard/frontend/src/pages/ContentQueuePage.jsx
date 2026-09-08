import { useMemo, useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import ContentItem from '../components/ContentItem';
import NewContentForm from '../components/forms/NewContentForm';
import ContentDetailModal from '../components/modals/ContentDetailModal';
import useContent from '../hooks/useContent';
import useProjects from '../hooks/useProjects';
import { THEMES } from '../utils/constants';

const PILLS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'high', label: 'High' },
];

export function ContentQueuePage() {
  const {
    content,
    loading,
    error,
    createContent,
    updateStatus,
    updateThoughts,
    deleteContent,
  } = useContent();
  const { projects } = useProjects();

  const [pill, setPill] = useState('all');
  const [themeFilter, setThemeFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => {
    return content.filter((item) => {
      if (pill === 'unread' && item.status !== 'Unread') return false;
      if (pill === 'high' && item.priority !== 'High') return false;
      if (themeFilter && item.theme !== themeFilter) return false;
      return true;
    });
  }, [content, pill, themeFilter]);

  const selectedItem = content.find((c) => c.id === selectedId) || null;

  return (
    <PageLayout title="Content queue">
      <button
        type="button"
        className="btn btn-primary page-top-action"
        onClick={() => setCreateModalOpen(true)}
      >
        + New content
      </button>

      <div className="filter-row">
        <div className="button-group">
          {PILLS.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`pill-button ${pill === p.key ? 'pill-button-active' : ''}`}
              onClick={() => setPill(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <select
          className="form-input filter-theme-select"
          value={themeFilter}
          onChange={(e) => setThemeFilter(e.target.value)}
        >
          <option value="">All themes</option>
          {THEMES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : error ? (
        <p className="form-error">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="empty-state">Nothing matches these filters.</p>
      ) : (
        <div className="content-list">
          {filtered.map((item) => (
            <ContentItem key={item.id} item={item} onClick={setSelectedId} />
          ))}
        </div>
      )}

      <NewContentForm
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={createContent}
        projects={projects}
      />

      <ContentDetailModal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedId(null)}
        item={selectedItem}
        onUpdateThoughts={updateThoughts}
        onUpdateStatus={updateStatus}
        onDelete={deleteContent}
      />
    </PageLayout>
  );
}

export default ContentQueuePage;
