import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  buildMonthGrid,
  WEEKDAY_LABELS,
  isToday,
  isSameDay,
  toDateKey,
} from '../utils/dateUtils';
import { palette, radius, spacing, typography } from '../../../theme';

interface MonthViewProps {
  viewDate: Date;
  selectedDate: Date;
  /** Date keys ('YYYY-MM-DD') that have at least one event — render a dot. */
  markedDates: Set<string>;
  onSelectDay: (date: Date) => void;
}

/**
 * Custom month grid — built from scratch (no third-party calendar component).
 * 7 columns x 6 rows, Monday-first, with leading/trailing days dimmed.
 */
export const MonthView: React.FC<MonthViewProps> = ({
  viewDate,
  selectedDate,
  markedDates,
  onSelectDay,
}) => {
  const cells = useMemo(() => buildMonthGrid(viewDate), [viewDate]);

  return (
    <View>
      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map(label => (
          <View key={label} style={styles.weekdayCell}>
            <Text style={styles.weekday}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map(cell => {
          const selected = isSameDay(cell.date, selectedDate);
          const today = isToday(cell.date);
          const marked = markedDates.has(toDateKey(cell.date));
          return (
            <Pressable
              key={cell.date.toISOString()}
              onPress={() => onSelectDay(cell.date)}
              style={styles.dayCell}>
              <View
                style={[
                  styles.dayInner,
                  selected && styles.daySelected,
                  today && !selected && styles.dayToday,
                ]}>
                <Text
                  style={[
                    styles.dayText,
                    !cell.isCurrentMonth && styles.dayMuted,
                    selected && styles.dayTextSelected,
                    today && !selected && styles.dayTextToday,
                  ]}>
                  {cell.date.getDate()}
                </Text>
              </View>
              <View
                style={[
                  styles.eventDot,
                  marked && cell.isCurrentMonth && styles.eventDotVisible,
                  selected && styles.eventDotOnSelected,
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  weekRow: { flexDirection: 'row', marginBottom: spacing.xs },
  weekdayCell: { flex: 1, alignItems: 'center' },
  weekday: { ...typography.caption, color: palette.textMuted, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dayInner: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: { backgroundColor: palette.primary },
  dayToday: { backgroundColor: palette.primaryLight },
  dayText: { ...typography.body, color: palette.text },
  dayMuted: { color: palette.border },
  dayTextSelected: { color: palette.textInverse, fontWeight: '700' },
  dayTextToday: { color: palette.primary, fontWeight: '700' },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: 'transparent',
  },
  eventDotVisible: { backgroundColor: palette.primary },
  eventDotOnSelected: { backgroundColor: 'transparent' },
});
