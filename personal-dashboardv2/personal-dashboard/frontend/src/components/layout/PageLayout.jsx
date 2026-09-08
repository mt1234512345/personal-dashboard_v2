import Hamburger from '../Hamburger';

/**
 * Wrapper for consistent page spacing/padding. Renders a sticky header
 * (title + Hamburger) and a padded content area below it.
 *
 * <PageLayout title="All tasks" subtitle="Sept 8">{children}</PageLayout>
 * <PageLayout title="Q4 Planning" onBack={() => navigate(-1)}>...</PageLayout>
 */
export function PageLayout({ title, subtitle, onBack, badge, children }) {
  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-text">
          {onBack && (
            <button type="button" className="back-button" onClick={onBack} aria-label="Back">
              ←
            </button>
          )}
          <div>
            <h1 className="page-title">
              {title}
              {badge}
            </h1>
            {subtitle && <div className="page-subtitle">{subtitle}</div>}
          </div>
        </div>
        <Hamburger />
      </header>
      <main className="page-content">{children}</main>
    </div>
  );
}

export default PageLayout;
