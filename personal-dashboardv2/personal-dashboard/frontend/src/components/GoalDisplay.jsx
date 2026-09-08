/**
 * <GoalDisplay goals={[...]} />
 * Renders 3 read-only bullet points.
 *
 * Accepts either plain strings (as the frontend spec's usage example
 * shows: goals={[goal1, goal2, goal3]}) or the { id|order, text } objects
 * the backend's /dashboard and /morning endpoints actually return -- the
 * spec's example and the backend's real response shape don't match, so
 * this normalizes either input rather than picking one and breaking the
 * other.
 */
export function GoalDisplay({ goals = [] }) {
  const texts = goals
    .map((g) => (typeof g === 'string' ? g : g?.text))
    .filter(Boolean);

  if (texts.length === 0) {
    return <p className="goal-display-empty">No goals set for today yet.</p>;
  }

  return (
    <ul className="goal-display">
      {texts.map((text, i) => (
        <li key={i} className="goal-display-item">
          {text}
        </li>
      ))}
    </ul>
  );
}

export default GoalDisplay;
