import { useCallback, useEffect, useState } from 'react';
import { weeklyService } from '../services/weeklyService';
import { currentWeekStart } from '../utils/dateUtils';

export function useWeeklyPlanning(weekStartDate = currentWeekStart()) {
  const [planning, setPlanning] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await weeklyService.getPlanning(weekStartDate);
      setPlanning(data);
    } catch (err) {
      setError(err.message || 'Failed to load weekly planning');
    } finally {
      setLoading(false);
    }
  }, [weekStartDate]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updateDay = useCallback(
    async (dayOfWeek, data) => {
      const result = await weeklyService.updateDay(dayOfWeek, {
        week_start_date: weekStartDate,
        ...data,
      });
      await refetch();
      return result;
    },
    [refetch, weekStartDate]
  );

  return { planning, loading, error, updateDay, refetch };
}

export default useWeeklyPlanning;
