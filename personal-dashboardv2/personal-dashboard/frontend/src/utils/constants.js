// Values here must match the backend's schema.sql CHECK constraints exactly.

export const THEMES = [
  'Focus & Depth',
  'Fitness',
  'Reflection',
  'Connection',
  'Personal',
];

export const PRIORITIES = ['High', 'Medium', 'Low'];

export const TASK_STATUSES = ['Open', 'Completed'];

export const DUE_DATE_TYPES = ['Today', 'Tomorrow', 'This week', 'Backlog', 'Specific'];

// Buckets used for grouping on AllTasksPage (mirrors backend's
// grouped_by_due_date keys -- Specific/ISO-date tasks are not grouped
// into these four, see dateUtils.groupTasksByDueDate).
export const DUE_DATE_BUCKETS = ['Today', 'Tomorrow', 'This week', 'Backlog'];

export const CONTENT_STATUSES = ['Unread', 'Reading', 'Read'];

export const PROJECT_STATUSES = ['Active', 'Paused', 'Completed'];

// weekly_planning.day_of_week CHECK constraint (backend schema omits
// Sunday -- see backend build notes). Kept in sync here so the day
// picker never offers a value the API will reject.
export const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
