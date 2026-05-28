import { useCallback, useMemo, useState } from 'react';
import { addMonths, addDays, startOfDay } from '../utils/dateUtils';

export type CalendarMode = 'month' | 'day';

/**
 * Owns calendar view state: current mode, the focused "view date" (drives which
 * month/day is shown), and the selected day. Kept as a hook so the screen is
 * purely presentational and the logic is unit-testable.
 */
export const useCalendar = (initial: Date = new Date()) => {
  const [mode, setMode] = useState<CalendarMode>('month');
  const [viewDate, setViewDate] = useState<Date>(startOfDay(initial));
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(initial));

  const goToNext = useCallback(() => {
    setViewDate(prev => (mode === 'month' ? addMonths(prev, 1) : addDays(prev, 1)));
  }, [mode]);

  const goToPrev = useCallback(() => {
    setViewDate(prev => (mode === 'month' ? addMonths(prev, -1) : addDays(prev, -1)));
  }, [mode]);

  const goToToday = useCallback(() => {
    const today = startOfDay(new Date());
    setViewDate(today);
    setSelectedDate(today);
  }, []);

  const selectDay = useCallback((date: Date) => {
    const d = startOfDay(date);
    setSelectedDate(d);
    setViewDate(d);
    setMode('day');
  }, []);

  const toggleMode = useCallback(() => {
    setMode(prev => (prev === 'month' ? 'day' : 'month'));
  }, []);

  return useMemo(
    () => ({
      mode,
      viewDate,
      selectedDate,
      setMode,
      goToNext,
      goToPrev,
      goToToday,
      selectDay,
      toggleMode,
    }),
    [mode, viewDate, selectedDate, goToNext, goToPrev, goToToday, selectDay, toggleMode],
  );
};
