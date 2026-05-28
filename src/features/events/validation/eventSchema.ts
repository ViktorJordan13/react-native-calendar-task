import { z } from 'zod';

/**
 * Event form validation. The `.refine` enforces end-after-start, which is the
 * kind of cross-field rule that's easy to miss and nice to show off.
 */
export const eventSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
    description: z.string().max(500, 'Description is too long'),
    startISO: z.string(),
    endISO: z.string(),
  })
  .refine(data => new Date(data.endISO) > new Date(data.startISO), {
    message: 'End time must be after start time',
    path: ['endISO'],
  });

export type EventFormValues = z.infer<typeof eventSchema>;
