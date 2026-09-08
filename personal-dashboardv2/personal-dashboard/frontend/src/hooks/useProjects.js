import { useCallback, useEffect, useState } from 'react';
import { projectsService } from '../services/projectsService';

export function useProjects(filters = {}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filtersKey = JSON.stringify(filters);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectsService.getAll(filters);
      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createProject = useCallback(
    async (data) => {
      const project = await projectsService.create(data);
      await refetch();
      return project;
    },
    [refetch]
  );

  const updateProject = useCallback(
    async (id, data) => {
      const project = await projectsService.update(id, data);
      await refetch();
      return project;
    },
    [refetch]
  );

  const deleteProject = useCallback(
    async (id) => {
      await projectsService.delete(id);
      await refetch();
    },
    [refetch]
  );

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch,
  };
}

export default useProjects;
