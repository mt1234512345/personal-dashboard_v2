import { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import EditDayForm from '../components/modals/EditDayForm';
import useWeeklyPlanning from '../hooks/useWeeklyPlanning';
import { formatReadTime } from '../utils/formatter';

export function WeeklyPlanningPage() {
  const { planning, loading, error, updateDay } = useWeeklyPlanning();
  const [editingDay, setEditingDay] = useState(null);

  const days = planning?.days || [];

  return (
    <PageLayout title="Weekly planning" subtitle={planning?.week_start_date}>
      {loading ? (
        <p className="muted">Loading…</p>
      ) : error ? (
        <p className="form-error">{error}</p>
      ) : (
        <div className="day-grid">
          {days.map((day) => (
            <section key={day.day_of_week} className="card day-card">
              <div className="card-header-row">
                <h2 className="card-title">{day.day_of_week}</h2>
                {day.theme && <span className="badge badge-theme">{day.theme}</span>}
              </div>

              {day.quote && <p className="day-quote">&ldquo;{day.quote}&rdquo;</p>}

              {day.reading && (day.reading.title || day.reading.url) && (
                <div className="reading-card">
                  <div className="reading-card-title">{day.reading.title}</div>
                  <div className="reading-card-meta">
                    {[day.reading.source, formatReadTime(day.reading.read_time)]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                  {day.reading.url && (
                    <a
                      href={day.reading.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-link"
                    >
                      Open →
                    </a>
                  )}
                </div>
              )}

              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={() => setEditingDay(day)}
              >
                Edit day
              </button>
            </section>
          ))}
        </div>
      )}

      <EditDayForm
        isOpen={Boolean(editingDay)}
        onClose={() => setEditingDay(null)}
        day={editingDay}
        onSave={updateDay}
      />
    </PageLayout>
  );
}

export default WeeklyPlanningPage;
