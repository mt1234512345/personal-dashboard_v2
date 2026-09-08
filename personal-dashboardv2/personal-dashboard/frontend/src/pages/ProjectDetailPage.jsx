import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import TaskItem from '../components/TaskItem';
import ContentItem from '../components/ContentItem';
import NewTaskForm from '../components/forms/NewTaskForm';
import NewContentForm from '../components/forms/NewContentForm';
import ContentDetailModal from '../components/modals/ContentDetailModal';
import useTasks from '../hooks/useTasks';
import useContent from '../hooks/useContent';
import useProjects from '../hooks/useProjects';
import { projectsService } from '../services/projectsService';
import { projectStatusClass } from '../utils/formatter';

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState(null);

  const {
    tasks,
    loading: tasksLoading,
    createTask,
    updateTask,
    toggleTask,
  } = useTasks({ project_id: id });
  const {
    content,
    loading: contentLoading,
    createContent,
    updateStatus,
    updateThoughts,
    deleteContent,
  } = useContent({ project_id: id });
  const { projects } = useProjects();

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setProjectLoading(true);
    setProjectError(null);
    projectsService
      .getById(id)
      .then((data) => {
        if (!cancelled) setProject(data);
      })
      .catch((err) => {
        if (!cancelled) setProjectError(err.message || 'Failed to load project');
      })
      .finally(() => {
        if (!cancelled) setProjectLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  function openCreateTaskModal() {
    setEditingTask(null);
    setTaskModalOpen(true);
  }

  function openEditTaskModal(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    setEditingTask(task || null);
    setTaskModalOpen(true);
  }

  async function handleSaveTask(data) {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask(data);
    }
  }

  const selectedContent = content.find((c) => c.id === selectedContentId) || null;

  if (projectLoading) {
    return (
      <PageLayout title="Loading…" onBack={() => navigate('/projects')}>
        <p className="muted">Loading project…</p>
      </PageLayout>
    );
  }

  if (projectError || !project) {
    return (
      <PageLayout title="Project" onBack={() => navigate('/projects')}>
        <p className="form-error">{projectError || 'Project not found.'}</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={project.title}
      onBack={() => navigate('/projects')}
      badge={
        <span className={`badge ${projectStatusClass(project.status)} title-badge`}>
          {project.status}
        </span>
      }
    >
      {project.description && (
        <section className="card">
          <p>{project.description}</p>
        </section>
      )}

      <section className="card">
        <div className="card-header-row">
          <h2 className="card-title">Tasks ({tasks.length})</h2>
          <button type="button" className="btn btn-primary btn-small" onClick={openCreateTaskModal}>
            + New task
          </button>
        </div>
        {tasksLoading ? (
          <p className="muted">Loading…</p>
        ) : tasks.length === 0 ? (
          <p className="empty-state">No tasks in this project yet.</p>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={toggleTask} onClick={openEditTaskModal} />
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <div className="card-header-row">
          <h2 className="card-title">Content ({content.length})</h2>
          <button
            type="button"
            className="btn btn-primary btn-small"
            onClick={() => setContentModalOpen(true)}
          >
            + New content
          </button>
        </div>
        {contentLoading ? (
          <p className="muted">Loading…</p>
        ) : content.length === 0 ? (
          <p className="empty-state">No content in this project yet.</p>
        ) : (
          <div className="content-list">
            {content.map((item) => (
              <ContentItem key={item.id} item={item} onClick={setSelectedContentId} />
            ))}
          </div>
        )}
      </section>

      <NewTaskForm
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        projectId={id}
        projects={projects}
      />
      <NewContentForm
        isOpen={contentModalOpen}
        onClose={() => setContentModalOpen(false)}
        onSave={createContent}
        projectId={id}
        projects={projects}
      />
      <ContentDetailModal
        isOpen={Boolean(selectedContent)}
        onClose={() => setSelectedContentId(null)}
        item={selectedContent}
        onUpdateThoughts={updateThoughts}
        onUpdateStatus={updateStatus}
        onDelete={deleteContent}
      />
    </PageLayout>
  );
}

export default ProjectDetailPage;
