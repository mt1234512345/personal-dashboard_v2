import { useCallback, useEffect, useState } from 'react';
import { tasksService } from '../services/tasksService';

export function useTasks(filters = {}) {
  const [tasks, setTasks] = useState([]);
  const [groupedByDueDate, setGroupedByDueDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filtersKey = JSON.stringify(filters);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksService.getAll(filters);
      setTasks(data.tasks || []);
      setGroupedByDueDate(data.grouped_by_due_date || null);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createTask = useCallback(
    async (data) => {
      const task = await tasksService.create(data);
      await refetch();
      return task;
    },
    [refetch]
  );

  const updateTask = useCallback(
    async (id, data) => {
      const task = await tasksService.update(id, data);
      await refetch();
      return task;
    },
    [refetch]
  );

  const deleteTask = useCallback(
    async (id) => {
      await tasksService.delete(id);
      await refetch();
    },
    [refetch]
  );

  const toggleTask = useCallback(
    async (id) => {
      const result = await tasksService.toggle(id);
      await refetch();
      return result;
    },
    [refetch]
  );

  return {
    tasks,
    groupedByDueDate,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    refetch,
  };
}

export default useTasks;
