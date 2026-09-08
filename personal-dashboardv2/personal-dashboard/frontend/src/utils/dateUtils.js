import { DUE_DATE_BUCKETS } from './constants';

/** Today's date as YYYY-MM-DD (local time). */
export function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

/** Monday (YYYY-MM-DD) of the week containing the given ISO date
 * (defaults to today). Mirrors the backend's week_start_date logic. */
export function currentWeekStart(dateISO = todayISO()) {
  const d = new Date(`${dateISO}T00:00:00`);
  const day = d.getDay(); // 0 = Sunday ... 6 = Saturday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return d.toISOString().slice(0, 10);
}

/** A friendly display label for today's date, e.g. "Tuesday, September 8". */
export function todayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/** Formats an ISO timestamp ("2026-09-08T14:30:00Z") for display. */
export function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Client-side fallback grouping for tasks by due_date_type, matching the
 * backend's /api/tasks grouped_by_due_date shape. Prefer the backend's own
 * `grouped_by_due_date` field when available -- this exists for when a
 * component only has the flat `tasks` array (e.g. after a local update). */
export function groupTasksByDueDate(tasks) {
  const grouped = { Today: [], Tomorrow: [], 'This week': [], Backlog: [] };
  for (const task of tasks) {
    if (DUE_DATE_BUCKETS.includes(task.due_date_type)) {
      grouped[task.due_date_type].push(task);
    } else if (task.due_date_type === 'Specific' && task.due_date) {
      grouped[task.due_date] = grouped[task.due_date] || [];
      grouped[task.due_date].push(task);
    }
  }
  return grouped;
}
