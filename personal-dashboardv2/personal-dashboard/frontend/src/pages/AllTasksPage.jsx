import { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import TaskItem from '../components/TaskItem';
import NewTaskForm from '../components/forms/NewTaskForm';
import useTasks from '../hooks/useTasks';
import useProjects from '../hooks/useProjects';
import { groupTasksByDueDate } from '../utils/dateUtils';
import { DUE_DATE_BUCKETS } from '../utils/constants';

export function AllTasksPage() {
  const { tasks, groupedByDueDate, loading, error, createTask, updateTask, toggleTask } = useTasks();
  const { projects } = useProjects();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const grouped = groupedByDueDate || groupTasksByDueDate(tasks);

  function openCreateModal() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEditModal(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    setEditingTask(task || null);
    setModalOpen(true);
  }

  async function handleSave(data) {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask(data);
    }
  }

  return (
    <PageLayout title="All tasks">
      <button type="button" className="btn btn-primary page-top-action" onClick={openCreateModal}>
        + New task
      </button>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : error ? (
        <p className="form-error">{error}</p>
      ) : (
        DUE_DATE_BUCKETS.map((bucket) => (
          <section key={bucket} className="card">
            <h2 className="card-title">{bucket}</h2>
            {(grouped[bucket] || []).length === 0 ? (
              <p className="empty-state">Nothing here.</p>
            ) : (
              <div className="task-list">
                {grouped[bucket].map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onClick={openEditModal}
                  />
                ))}
              </div>
            )}
          </section>
        ))
      )}

      <NewTaskForm
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        task={editingTask}
        projects={projects}
      />
    </PageLayout>
  );
}

export default AllTasksPage;
