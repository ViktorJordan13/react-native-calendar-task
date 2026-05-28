import { useEffect, useState } from 'react';
import { eventsService } from '../services/eventsService';
import { CalendarEvent } from '../types';
import { useAuth } from '../../../providers/AuthProvider';

/**
 * Subscribes to the current user's events for a given day. Real-time: edits
 * from the editor screen reflect here immediately via Firestore's snapshot
 * listener, so we never manually refetch.
 */
export const useDayEvents = (day: Date) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsubscribe = eventsService.subscribeToDay(
      user.uid,
      day,
      next => {
        setEvents(next);
        setLoading(false);
      },
      err => {
        setError(err.message);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [user, day]);

  return { events, loading, error };
};
