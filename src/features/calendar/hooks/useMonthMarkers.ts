import { useEffect, useState } from 'react';
import { eventsService } from '../../events/services/eventsService';
import { useAuth } from '../../../providers/AuthProvider';

/**
 * Subscribes to which days in the visible month have events, so MonthView can
 * render dots. Recomputes the month bounds whenever the view date's month
 * changes.
 */
export const useMonthMarkers = (viewDate: Date) => {
  const { user } = useAuth();
  const [markedDates, setMarkedDates] = useState<Set<string>>(new Set());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  useEffect(() => {
    if (!user) return;
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const unsubscribe = eventsService.subscribeToMonthMarkers(
      user.uid,
      monthStart,
      monthEnd,
      setMarkedDates,
    );
    return unsubscribe;
  }, [user, year, month]);

  return markedDates;
};
