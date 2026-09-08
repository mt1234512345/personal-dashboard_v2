import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import PrivateRoute from './auth/PrivateRoute';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AllTasksPage from './pages/AllTasksPage';
import ContentQueuePage from './pages/ContentQueuePage';
import ProjectsListPage from './pages/ProjectsListPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import WeeklyPlanningPage from './pages/WeeklyPlanningPage';
import DailyIntakePage from './pages/DailyIntakePage';
import NotFoundPage from './pages/NotFoundPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <AllTasksPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/content"
            element={
              <PrivateRoute>
                <ContentQueuePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <PrivateRoute>
                <ProjectsListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <PrivateRoute>
                <ProjectDetailPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/planning"
            element={
              <PrivateRoute>
                <WeeklyPlanningPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/daily-intake"
            element={
              <PrivateRoute>
                <DailyIntakePage />
              </PrivateRoute>
            }
          />

          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
