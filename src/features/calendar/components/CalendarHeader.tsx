import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CalendarMode } from '../hooks/useCalendar';
import { formatMonthYear, formatFullDate } from '../utils/dateUtils';
import { palette, radius, spacing, typography } from '../../../theme';

interface CalendarHeaderProps {
  mode: CalendarMode;
  viewDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onToggleMode: () => void;
}

/** Title + prev/next arrows + Today + Month/Day segmented toggle. */
export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  mode,
  viewDate,
  onPrev,
  onNext,
  onToday,
  onToggleMode,
}) => (
  <View style={styles.wrap}>
    <View style={styles.row}>
      <Text style={styles.title}>
        {mode === 'month' ? formatMonthYear(viewDate) : formatFullDate(viewDate)}
      </Text>
      <Pressable onPress={onToday} hitSlop={8} style={styles.todayBtn}>
        <Text style={styles.todayText}>Today</Text>
      </Pressable>
    </View>

    <View style={styles.row}>
      <View style={styles.arrows}>
        <Pressable onPress={onPrev} hitSlop={8} style={styles.arrow}>
          <Text style={styles.arrowText}>‹</Text>
        </Pressable>
        <Pressable onPress={onNext} hitSlop={8} style={styles.arrow}>
          <Text style={styles.arrowText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.toggle}>
        <Pressable
          onPress={mode !== 'month' ? onToggleMode : undefined}
          style={[styles.segment, mode === 'month' && styles.segmentActive]}>
          <Text style={[styles.segmentText, mode === 'month' && styles.segmentTextActive]}>
            Month
          </Text>
        </Pressable>
        <Pressable
          onPress={mode !== 'day' ? onToggleMode : undefined}
          style={[styles.segment, mode === 'day' && styles.segmentActive]}>
          <Text style={[styles.segmentText, mode === 'day' && styles.segmentTextActive]}>
            Day
          </Text>
        </Pressable>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, paddingBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { ...typography.h2, color: palette.text },
  todayBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceAlt,
  },
  todayText: { ...typography.label, color: palette.primary },
  arrows: { flexDirection: 'row', gap: spacing.sm },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: { fontSize: 22, color: palette.text, lineHeight: 24 },
  toggle: {
    flexDirection: 'row',
    backgroundColor: palette.surfaceAlt,
    borderRadius: radius.md,
    padding: 2,
  },
  segment: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  segmentActive: { backgroundColor: palette.background },
  segmentText: { ...typography.label, color: palette.textMuted },
  segmentTextActive: { color: palette.text },
});
