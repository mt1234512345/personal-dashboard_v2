import { useCallback, useEffect, useState } from 'react';
import { contentService } from '../services/contentService';

export function useContent(filters = {}) {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filtersKey = JSON.stringify(filters);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await contentService.getAll(filters);
      setContent(data.content || []);
    } catch (err) {
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createContent = useCallback(
    async (data) => {
      const item = await contentService.create(data);
      await refetch();
      return item;
    },
    [refetch]
  );

  const updateContent = useCallback(
    async (id, data) => {
      const item = await contentService.update(id, data);
      await refetch();
      return item;
    },
    [refetch]
  );

  const deleteContent = useCallback(
    async (id) => {
      await contentService.delete(id);
      await refetch();
    },
    [refetch]
  );

  const updateStatus = useCallback(
    async (id, status) => {
      const item = await contentService.updateStatus(id, status);
      await refetch();
      return item;
    },
    [refetch]
  );

  const updateThoughts = useCallback(
    async (id, thoughts) => {
      const item = await contentService.updateThoughts(id, thoughts);
      await refetch();
      return item;
    },
    [refetch]
  );

  return {
    content,
    loading,
    error,
    createContent,
    updateContent,
    deleteContent,
    updateStatus,
    updateThoughts,
    refetch,
  };
}

export default useContent;
