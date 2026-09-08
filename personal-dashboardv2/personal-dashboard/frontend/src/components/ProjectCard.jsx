import { projectStatusClass } from '../utils/formatter';

/**
 * <ProjectCard project={{id,title,description,status,task_count,content_count}}
 *   onClick={(id) => void} />
 * Renders: title + description + status badge + counts. Faded when
 * status !== 'Active'.
 */
export function ProjectCard({ project, onClick }) {
  const isFaded = project.status !== 'Active';

  return (
    <div
      className={`project-card ${isFaded ? 'project-card-faded' : ''}`}
      onClick={() => onClick && onClick(project.id)}
    >
      <div className="project-card-header">
        <span className="project-card-title">{project.title}</span>
        <span className={`badge ${projectStatusClass(project.status)}`}>
          {project.status}
        </span>
      </div>
      {project.description && (
        <p className="project-card-description">{project.description}</p>
      )}
      <div className="project-card-counts">
        <span>{project.task_count ?? 0} tasks</span>
        <span>{project.content_count ?? 0} content</span>
      </div>
    </div>
  );
}

export default ProjectCard;
