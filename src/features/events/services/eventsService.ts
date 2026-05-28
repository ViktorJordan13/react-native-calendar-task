/**
 * Events service — the ONLY module touching Firestore for events.
 * Mirrors the auth-service pattern: isolating the backend keeps the UI/hooks
 * testable and the storage swappable.
 *
 * Data model: /events/{autoId} with an ownerId field and a denormalized
 * dateKey ('YYYY-MM-DD') so we can query a single day cheaply with a composite
 * (ownerId == uid && dateKey == key) filter.
 */
import { db, EVENTS_COLLECTION } from '../../../lib/firebase';
import { CalendarEvent, EventDraft } from '../types';
import { toDateKey } from '../../calendar/utils/dateUtils';

const collection = () => db.collection(EVENTS_COLLECTION);

export const eventsService = {
  /** Live subscription to a user's events for a given day. Returns unsubscribe. */
  subscribeToDay(
    ownerId: string,
    day: Date,
    onChange: (events: CalendarEvent[]) => void,
    onError?: (e: Error) => void,
  ): () => void {
    const dateKey = toDateKey(day);
    return collection()
      .where('ownerId', '==', ownerId)
      .where('dateKey', '==', dateKey)
      .onSnapshot(
        snapshot => {
          const events = snapshot.docs
            .map(doc => ({ id: doc.id, ...(doc.data() as Omit<CalendarEvent, 'id'>) }))
            .sort((a, b) => a.startISO.localeCompare(b.startISO));
          onChange(events);
        },
        err => onError?.(err),
      );
  },

  /** Days in a month that have at least one event — powers month-view dots. */
  subscribeToMonthMarkers(
    ownerId: string,
    monthStart: Date,
    monthEnd: Date,
    onChange: (dateKeys: Set<string>) => void,
  ): () => void {
    return collection()
      .where('ownerId', '==', ownerId)
      .where('dateKey', '>=', toDateKey(monthStart))
      .where('dateKey', '<=', toDateKey(monthEnd))
      .onSnapshot(snapshot => {
        const keys = new Set<string>();
        snapshot.docs.forEach(d => keys.add((d.data() as CalendarEvent).dateKey));
        onChange(keys);
      });
  },

  async getById(id: string): Promise<CalendarEvent | null> {
    const doc = await collection().doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as Omit<CalendarEvent, 'id'>) };
  },

  async create(ownerId: string, draft: EventDraft): Promise<string> {
    const dateKey = toDateKey(new Date(draft.startISO));
    const ref = await collection().add({ ...draft, dateKey, ownerId });
    return ref.id;
  },

  async update(id: string, draft: EventDraft): Promise<void> {
    const dateKey = toDateKey(new Date(draft.startISO));
    await collection().doc(id).update({ ...draft, dateKey });
  },

  async remove(id: string): Promise<void> {
    await collection().doc(id).delete();
  },
};
