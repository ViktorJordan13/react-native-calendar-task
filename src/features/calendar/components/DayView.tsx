import React from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { CalendarEvent } from '../../events/types';
import { toTimeLabel } from '../utils/dateUtils';
import { palette, radius, spacing, typography } from '../../../theme';

interface DayViewProps {
  events: CalendarEvent[];
  loading: boolean;
  onPressEvent: (event: CalendarEvent) => void;
}

/** Agenda-style list of the selected day's events. */
export const DayView: React.FC<DayViewProps> = ({
  events,
  loading,
  onPressEvent,
}) => {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={palette.primary} />
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No meetings</Text>
        <Text style={styles.emptyBody}>Tap + to add an event for this day.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={events}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onPressEvent(item)}
          style={styles.card}
          testID={`event-${item.id}`}>
          <View style={styles.timeColumn}>
            <Text style={styles.time}>{toTimeLabel(new Date(item.startISO))}</Text>
            <Text style={styles.timeEnd}>{toTimeLabel(new Date(item.endISO))}</Text>
          </View>
          <View style={styles.accent} />
          <View style={styles.body}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {!!item.description && (
              <Text style={styles.cardDesc} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>
        </Pressable>
      )}
    />
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  emptyTitle: { ...typography.h3, color: palette.text },
  emptyBody: { ...typography.body, color: palette.textMuted },
  list: { paddingVertical: spacing.md, gap: spacing.sm },
  card: {
    flexDirection: 'row',
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  timeColumn: { width: 56 },
  time: { ...typography.bodyBold, color: palette.text },
  timeEnd: { ...typography.caption, color: palette.textMuted },
  accent: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
    marginHorizontal: spacing.md,
  },
  body: { flex: 1 },
  cardTitle: { ...typography.bodyBold, color: palette.text },
  cardDesc: { ...typography.caption, color: palette.textMuted, marginTop: 2 },
});
