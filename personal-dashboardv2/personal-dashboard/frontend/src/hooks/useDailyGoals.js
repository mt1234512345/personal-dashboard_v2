import { useCallback, useEffect, useState } from 'react';
import { dailyService } from '../services/dailyService';

export function useDailyGoals() {
  const [morning, setMorning] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dailyService.getMorning();
      setMorning(data);
    } catch (err) {
      setError(err.message || 'Failed to load morning brief');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const saveMorning = useCallback(
    async (goalData) => {
      const result = await dailyService.postMorning(goalData);
      await refetch();
      return result;
    },
    [refetch]
  );

  return { morning, loading, error, saveMorning, refetch };
}

export default useDailyGoals;
