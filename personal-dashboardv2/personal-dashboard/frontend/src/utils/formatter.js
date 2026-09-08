/** Maps a priority value to a CSS class suffix used by badge styles. */
export function priorityClass(priority) {
  switch (priority) {
    case 'High':
      return 'priority-high';
    case 'Medium':
      return 'priority-medium';
    case 'Low':
      return 'priority-low';
    default:
      return 'priority-medium';
  }
}

export function statusDotClass(item) {
  // Blue dot for unread + high priority, gray otherwise.
  if (item.status === 'Unread' && item.priority === 'High') return 'dot-accent';
  return 'dot-muted';
}

export function projectStatusClass(status) {
  switch (status) {
    case 'Active':
      return 'status-active';
    case 'Paused':
      return 'status-paused';
    case 'Completed':
      return 'status-completed';
    default:
      return 'status-active';
  }
}

export function formatReadTime(minutes) {
  if (minutes === null || minutes === undefined) return null;
  return `${minutes} min read`;
}

/** Builds a query string (no leading "?") from a filters object, skipping
 * empty values. Services call this as `${endpoint}?${queryString(filters)}`
 * per the frontend spec, so this deliberately returns without the "?". */
export function queryString(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, value);
    }
  });
  return params.toString();
}
