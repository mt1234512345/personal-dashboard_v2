import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const MENU_ITEMS = [
  { label: "Today's Home", path: '/' },
  { label: 'All tasks', path: '/tasks' },
  { label: 'Content queue', path: '/content' },
  { label: 'Weekly planning', path: '/planning' },
  { label: 'Projects', path: '/projects' },
];

/** Top-right hamburger menu, shared across all page headers. */
export function Hamburger() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;

    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleSelect(path) {
    setOpen(false);
    navigate(path);
  }

  return (
    <div className="hamburger" ref={containerRef}>
      <button
        type="button"
        className="hamburger-button"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
      {open && (
        <div className="hamburger-menu">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.path}
              type="button"
              className={`hamburger-menu-item ${
                location.pathname === item.path ? 'hamburger-menu-item-active' : ''
              }`}
              onClick={() => handleSelect(item.path)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Hamburger;
