import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import ProjectCard from '../components/ProjectCard';
import NewProjectForm from '../components/forms/NewProjectForm';
import useProjects from '../hooks/useProjects';

export function ProjectsListPage() {
  const { projects, loading, error, createProject } = useProjects();
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <PageLayout title="Projects">
      <button type="button" className="btn btn-primary page-top-action" onClick={() => setModalOpen(true)}>
        + New project
      </button>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : error ? (
        <p className="form-error">{error}</p>
      ) : projects.length === 0 ? (
        <p className="empty-state">No projects yet. Create your first one.</p>
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
