import { priorityClass, statusDotClass, formatReadTime } from '../utils/formatter';

/**
 * <ContentItem item={{id,title,source,read_time,status,priority,theme}}
 *   onClick={(id) => void} />
 * Renders: status dot + title + source/read_time + badges. Struck-through
 * + muted when status === 'Read'.
 */
export function ContentItem({ item, onClick }) {
  const isRead = item.status === 'Read';
  const readTime = formatReadTime(item.read_time);

  return (
    <div
      className={`content-item ${isRead ? 'content-item-read' : ''}`}
      onClick={() => onClick && onClick(item.id)}
    >
      <span className={`status-dot ${statusDotClass(item)}`} aria-hidden="true" />
      <div className="content-item-body">
        <div className="content-item-title">{item.title}</div>
        <div className="content-item-meta">
          {[item.source, readTime].filter(Boolean).join(' · ')}
        </div>
      </div>
      <div className="content-item-badges">
        <span className={`badge ${priorityClass(item.priority)}`}>{item.priority}</span>
        {item.theme && <span className="badge badge-theme">{item.theme}</span>}
      </div>
    </div>
  );
}

export default ContentItem;
