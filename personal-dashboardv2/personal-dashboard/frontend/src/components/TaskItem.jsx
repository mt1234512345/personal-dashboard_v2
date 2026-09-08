import { priorityClass } from '../utils/formatter';

/**
 * <TaskItem task={{id,title,priority,status,project_id,theme}}
 *   onToggle={(id) => void} onClick={(id) => void} />
 * Renders: checkbox + title + priority badge. Strikethrough + fade when
 * status === 'Completed'.
 */
export function TaskItem({ task, onToggle, onClick }) {
  const isCompleted = task.status === 'Completed';

  return (
    <div
      className={`task-item ${isCompleted ? 'task-item-completed' : ''}`}
      onClick={() => onClick && onClick(task.id)}
    >
      <input
        type="checkbox"
        className="task-item-checkbox"
        checked={isCompleted}
        onChange={(e) => {
          e.stopPropagation();
          onToggle && onToggle(task.id);
        }}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Mark "${task.title}" ${isCompleted ? 'open' : 'complete'}`}
      />
      <span className="task-item-title">{task.title}</span>
      <span className={`badge ${priorityClass(task.priority)}`}>{task.priority}</span>
      {task.theme && <span className="badge badge-theme">{task.theme}</span>}
    </div>
  );
}

export default TaskItem;
