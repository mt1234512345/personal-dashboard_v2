import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import NewTaskForm from '../components/forms/NewTaskForm';
import useDailyGoals from '../hooks/useDailyGoals';
import useTasks from '../hooks/useTasks';
import useProjects from '../hooks/useProjects';
import { formatReadTime } from '../utils/formatter';

export function DailyIntakePage() {
  const navigate = useNavigate();
  const { morning, loading, error, saveMorning } = useDailyGoals();
  const { tasks, loading: tasksLoading, error: tasksError, createTask } = useTasks({
    due_date: 'Today',
  });
  const { projects } = useProjects();

  const [goalFields, setGoalFields] = useState(['', '', '']);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const visibleTasks = tasks.filter((task) => task.status !== 'Completed');

  useEffect(() => {
    if (!morning?.goals) {
      setGoalFields(['', '', '']);
      return;
    }

    setGoalFields(
      Array.from({ length: 3 }, (_, index) => morning.goals[index]?.text || '')
    );
  }, [morning]);

  function toggleTask(taskId) {
    setSelectedTaskIds((current) =>
      current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSubmitError(null);

    try {
      await saveMorning({
        goal1: goalFields[0].trim() || null,
        goal2: goalFields[1].trim() || null,
        goal3: goalFields[2].trim() || null,
        task_ids_checked: selectedTaskIds,
      });
      navigate('/');
    } catch (err) {
      setSubmitError(err.message || 'Could not save today’s intake.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageLayout title="Daily intake" onBack={() => navigate('/')}>
      {loading ? (
        <p className="muted">Loading today’s brief…</p>
      ) : error ? (
        <p className="form-error">{error}</p>
      ) : (
        <form className="daily-intake-form" onSubmit={handleSubmit}>
          <section className="card daily-feature-card">
            <h2 className="card-title">Today’s inspiration</h2>
            {morning?.quote ? (
              <p className="day-quote daily-quote">“{morning.quote}”</p>
            ) : (
              <p className="empty-state">No quote selected for today yet.</p>
            )}

            {morning?.reading ? (
              <div
                className="content-item daily-reading-card"
                onClick={() => morning.reading.url && window.open(morning.reading.url, '_blank', 'noopener,noreferrer')}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    if (morning.reading.url) {
                      window.open(morning.reading.url, '_blank', 'noopener,noreferrer');
                    }
                  }
                }}
              >
                <span className="status-dot dot-muted" aria-hidden="true" />
                <div className="content-item-body">
                  <div className="content-item-title">{morning.reading.title}</div>
                  <div className="content-item-meta">
                    {[morning.reading.source, formatReadTime(morning.reading.read_time)]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </div>
              </div>
            ) : (
              <p className="empty-state">No reading selected for today yet.</p>
            )}
          </section>

          <section className="card">
            <h2 className="card-title">Today’s goals</h2>
            <div className="form-fieldset">
              {goalFields.map((value, index) => (
                <label key={index} className="form-field">
                  <span className="form-label">Goal {index + 1}</span>
                  <input
                    type="text"
                    className="form-input"
                    value={value}
                    onChange={(event) => {
                      const next = [...goalFields];
                      next[index] = event.target.value;
                      setGoalFields(next);
                    }}
                    placeholder={`Goal ${index + 1}`}
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="card-header-row">
              <h2 className="card-title">Tasks for today</h2>
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={() => setTaskModalOpen(true)}
              >
                + New task
              </button>
            </div>
            {tasksLoading ? (
              <p className="muted">Loading tasks…</p>
            ) : tasksError ? (
              <p className="form-error">{tasksError}</p>
            ) : visibleTasks.length === 0 ? (
              <p className="empty-state">No active tasks scheduled for today yet.</p>
            ) : (
              <div className="task-checklist">
                {visibleTasks.map((task) => (
                  <label key={task.id} className="task-checklist-item">
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.includes(task.id)}
                      onChange={() => toggleTask(task.id)}
                    />
                    <span>{task.title}</span>
                  </label>
                ))}
              </div>
            )}
          </section>

          {submitError && <p className="form-error">{submitError}</p>}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save daily plan'}
            </button>
          </div>
        </form>
      )}

      <NewTaskForm
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={async (payload) => {
          const task = await createTask(payload);
          if (task && task.id) {
            setSelectedTaskIds((current) => [...new Set([...current, task.id])]);
          }
          return task;
        }}
        projects={projects}
      />
    </PageLayout>
  );
}

export default DailyIntakePage;
