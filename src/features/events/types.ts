/**
 * Event (meeting) domain model. Kept framework-agnostic so it can be shared
 * between the Firestore service, hooks, and UI without leaking backend shapes.
 */

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  /** ISO strings in storage; converted to Date at the UI boundary. */
  startISO: string;
  endISO: string;
  /** 'YYYY-MM-DD' — denormalized day key for efficient per-day queries. */
  dateKey: string;
  ownerId: string;
}

/** Shape used when creating/editing — id and ownerId are assigned by the service. */
export interface EventDraft {
  title: string;
  description: string;
  startISO: string;
  endISO: string;
}
