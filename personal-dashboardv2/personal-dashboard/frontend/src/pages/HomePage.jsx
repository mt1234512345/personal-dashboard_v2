import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import GoalDisplay from '../components/GoalDisplay';
import TaskItem from '../components/TaskItem';
import NewTaskForm from '../components/forms/NewTaskForm';
import NewContentForm from '../components/forms/NewContentForm';
import useDailyGoals from '../hooks/useDailyGoals';
import useTasks from '../hooks/useTasks';
import useContent from '../hooks/useContent';
import useProjects from '../hooks/useProjects';
import { todayLabel } from '../utils/dateUtils';
import { formatReadTime } from '../utils/formatter';

export function HomePage() {
  const { morning, loading: goalsLoading, error: goalsError } = useDailyGoals();
  const { tasks, loading: tasksLoading, error: tasksError, createTask, toggleTask } = useTasks({
    due_date: 'Today',
  });
  const {
    content,
    loading: contentLoading,
    createContent,
    updateStatus,
  } = useContent({ status: 'Unread' });
  const { projects } = useProjects();

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [contentModalOpen, setContentModalOpen] = useState(false);

  const preview = content.slice(0, 2);

  return (
    <PageLayout title="Today" subtitle={todayLabel()}>
      <section className="card">
        <h2 className="card-title">Today's goals</h2>
        {goalsLoading ? (
          <p className="muted">Loading…</p>
        ) : goalsError ? (
          <p className="form-error">{goalsError}</p>
        ) : (
          <GoalDisplay goals={morning?.goals || []} />
        )}
      </section>

      <section className="card">
        <h2 className="card-title">Today's tasks</h2>
        {tasksLoading ? (
          <p className="muted">Loading…</p>
        ) : tasksError ? (
          <p className="form-error">{tasksError}</p>
        ) : tasks.length === 0 ? (
          <p className="empty-state">Nothing due today. Add a task to get started.</p>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={toggleTask} onClick={() => {}} />
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <div className="card-header-row">
          <h2 className="card-title">Content queue</h2>
          <Link to="/content" className="btn-link">
            View all →
          </Link>
        </div>
        {contentLoading ? (
          <p className="muted">Loading…</p>
        ) : preview.length === 0 ? (
          <p className="empty-state">Your queue is empty.</p>
        ) : (
          <div className="content-preview-list">
            {preview.map((item) => (
              <div key={item.id} className="content-preview-item">
                <div>
                  <div className="content-item-title">{item.title}</div>
                  <div className="content-item-meta">
                    {[item.source, formatReadTime(item.read_time)].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div className="content-preview-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-small"
                    onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-small"
                    onClick={() => updateStatus(item.id, 'Read')}
                  >
                    Mark read
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="home-actions">
        <button type="button" className="btn btn-primary" onClick={() => setTaskModalOpen(true)}>
          + Add task
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => setContentModalOpen(true)}>
          + Add content
        </button>
      </div>

      <NewTaskForm
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={createTask}
        projects={projects}
      />
      <NewContentForm
        isOpen={contentModalOpen}
        onClose={() => setContentModalOpen(false)}
        onSave={createContent}
        projects={projects}
      />
    </PageLayout>
  );
}

export default HomePage;
