import {
  startOfDay,
  isSameDay,
  isToday,
  addDays,
  addMonths,
  buildMonthGrid,
  toDateKey,
  toTimeLabel,
  formatMonthYear,
} from '../src/features/calendar/utils/dateUtils';

describe('dateUtils', () => {
  describe('startOfDay', () => {
    it('strips the time component', () => {
      const d = new Date(2026, 4, 28, 15, 42, 9);
      const result = startOfDay(d);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getDate()).toBe(28);
    });
  });

  describe('isSameDay', () => {
    it('returns true for same calendar day regardless of time', () => {
      expect(isSameDay(new Date(2026, 4, 28, 1), new Date(2026, 4, 28, 23))).toBe(true);
    });
    it('returns false across day boundaries', () => {
      expect(isSameDay(new Date(2026, 4, 28), new Date(2026, 4, 29))).toBe(false);
    });
  });

  describe('isToday', () => {
    it('recognizes the current date', () => {
      expect(isToday(new Date())).toBe(true);
    });
    it('rejects a different date', () => {
      expect(isToday(new Date(2000, 0, 1))).toBe(false);
    });
  });

  describe('addDays / addMonths', () => {
    it('adds days across month boundary', () => {
      const result = addDays(new Date(2026, 4, 31), 1);
      expect(result.getMonth()).toBe(5); // June
      expect(result.getDate()).toBe(1);
    });
    it('subtracts days with negative input', () => {
      const result = addDays(new Date(2026, 4, 1), -1);
      expect(result.getMonth()).toBe(3); // April
      expect(result.getDate()).toBe(30);
    });
    it('adds months', () => {
      expect(addMonths(new Date(2026, 11, 15), 1).getFullYear()).toBe(2027);
    });
  });

  describe('buildMonthGrid', () => {
    it('always returns 42 cells', () => {
      expect(buildMonthGrid(new Date(2026, 4, 1))).toHaveLength(42);
    });
    it('starts on a Monday (Monday-first grid)', () => {
      const grid = buildMonthGrid(new Date(2026, 4, 1));
      // May 1 2026 is a Friday -> grid starts Mon Apr 27.
      expect(grid[0].date.getDay()).toBe(1); // Monday
      expect(grid[0].date.getMonth()).toBe(3); // April
      expect(grid[0].date.getDate()).toBe(27);
    });
    it('flags current-month days correctly', () => {
      const grid = buildMonthGrid(new Date(2026, 4, 1));
      expect(grid.filter(c => c.isCurrentMonth)).toHaveLength(31); // May has 31
    });
  });

  describe('toDateKey', () => {
    it('zero-pads month and day', () => {
      expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    });
  });

  describe('toTimeLabel', () => {
    it('formats 24h time with padding', () => {
      expect(toTimeLabel(new Date(2026, 0, 1, 9, 5))).toBe('09:05');
    });
  });

  describe('formatMonthYear', () => {
    it('produces a readable month label', () => {
      expect(formatMonthYear(new Date(2026, 4, 1))).toBe('May 2026');
    });
  });
});
