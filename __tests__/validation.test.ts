import {
  signInSchema,
  signUpSchema,
} from '../src/features/auth/validation/authSchema';
import { eventSchema } from '../src/features/events/validation/eventSchema';

describe('auth validation', () => {
  describe('signUpSchema', () => {
    it('accepts a valid email and strong password', () => {
      const result = signUpSchema.safeParse({
        email: 'user@example.com',
        password: 'Password1',
      });
      expect(result.success).toBe(true);
    });
    it('rejects a weak password (no number)', () => {
      const result = signUpSchema.safeParse({
        email: 'user@example.com',
        password: 'Password',
      });
      expect(result.success).toBe(false);
    });
    it('rejects an invalid email', () => {
      const result = signUpSchema.safeParse({
        email: 'not-an-email',
        password: 'Password1',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('signInSchema', () => {
    it('requires a non-empty password', () => {
      const result = signInSchema.safeParse({ email: 'a@b.com', password: '' });
      expect(result.success).toBe(false);
    });
  });
});

describe('event validation', () => {
  const base = {
    title: 'Standup',
    description: '',
    startISO: new Date(2026, 4, 28, 9, 0).toISOString(),
    endISO: new Date(2026, 4, 28, 9, 30).toISOString(),
  };

  it('accepts a valid event', () => {
    expect(eventSchema.safeParse(base).success).toBe(true);
  });

  it('rejects an empty title', () => {
    expect(eventSchema.safeParse({ ...base, title: '' }).success).toBe(false);
  });

  it('rejects end before start (cross-field rule)', () => {
    const bad = {
      ...base,
      startISO: new Date(2026, 4, 28, 10, 0).toISOString(),
      endISO: new Date(2026, 4, 28, 9, 0).toISOString(),
    };
    const result = eventSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });
});
