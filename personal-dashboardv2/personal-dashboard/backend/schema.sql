-- schema.sql
-- Main app database (app.db). Journal data lives in a separate, local-only
-- database and is intentionally not included here.

CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('Active', 'Paused', 'Completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    due_date TEXT,  -- "Today", "Tomorrow", "This week", "Backlog", or ISO date YYYY-MM-DD
    due_date_type TEXT CHECK (due_date_type IN ('Today', 'Tomorrow', 'This week', 'Backlog', 'Specific')),
    priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
    theme TEXT,  -- 'Focus & Depth', 'Fitness', 'Reflection', 'Connection', 'Personal', or NULL
    status TEXT NOT NULL CHECK (status IN ('Open', 'Completed')),
    project_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    source TEXT,  -- e.g., "Cal Newport", "Axios"
    read_time INTEGER,  -- minutes
    priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
    theme TEXT,  -- Same options as tasks
    status TEXT NOT NULL CHECK (status IN ('Unread', 'Reading', 'Read')),
    thoughts TEXT,  -- User's notes/impressions
    project_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS daily_intentions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,  -- ISO format YYYY-MM-DD
    goal1 TEXT,
    goal2 TEXT,
    goal3 TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NOTE: this CHECK constraint (Monday-Saturday, no Sunday) is copied
-- verbatim from BACKEND_SPEC.md. It looks like an omission in the spec
-- rather than an intentional 6-day week -- flagged in the build summary.
CREATE TABLE IF NOT EXISTS weekly_planning (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_start_date TEXT NOT NULL,  -- ISO format YYYY-MM-DD (Monday of week)
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
    theme TEXT,  -- e.g., 'Deep Work', 'Reflection'
    quote TEXT,
    reading_title TEXT,
    reading_url TEXT,
    reading_source TEXT,
    reading_time INTEGER,  -- minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (week_start_date, day_of_week)
);

CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_due_date_type ON tasks(due_date_type);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_project_id ON content(project_id);
CREATE INDEX IF NOT EXISTS idx_weekly_planning_week_start ON weekly_planning(week_start_date);
