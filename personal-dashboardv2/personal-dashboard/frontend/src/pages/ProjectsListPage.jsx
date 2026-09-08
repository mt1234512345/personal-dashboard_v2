import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import ProjectCard from '../components/ProjectCard';
import NewProjectForm from '../components/forms/NewProjectForm';
import useProjects from '../hooks/useProjects';
import { PROJECT_STATUSES } from '../utils/constants';

export function ProjectsListPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const activeStatus = statusFilter === 'All' ? undefined : statusFilter;
  const { projects, loading, error, createProject } = useProjects(
    activeStatus ? { status: activeStatus } : {}
  );
  const navigate = useNavigate();

  return (
    <PageLayout title="Projects">
      <div className="filter-row">
        <button type="button" className="btn btn-primary page-top-action" onClick={() => setModalOpen(true)}>
          + New project
        </button>
        <div className="button-group">
          {['All', ...PROJECT_STATUSES].map((status) => (
            <button
              key={status}
              type="button"
              className={`pill-button ${statusFilter === status ? 'pill-button-active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : error ? (
        <p className="form-error">{error}</p>
      ) : projects.length === 0 ? (
        <p className="empty-state">
          {statusFilter === 'All' ? 'No projects yet. Create your first one.' : `No ${statusFilter.toLowerCase()} projects yet.`}
        </p>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={(id) => navigate(`/projects/${id}`)}
            />
          ))}
        </div>
      )}

      <NewProjectForm isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={createProject} />
    </PageLayout>
  );
}

export default ProjectsListPage;
