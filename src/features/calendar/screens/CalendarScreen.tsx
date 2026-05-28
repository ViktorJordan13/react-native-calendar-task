import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../../components/Screen';
import { CalendarHeader } from '../components/CalendarHeader';
import { MonthView } from '../components/MonthView';
import { DayView } from '../components/DayView';
import { useCalendar } from '../hooks/useCalendar';
import { useMonthMarkers } from '../hooks/useMonthMarkers';
import { useDayEvents } from '../../events/hooks/useDayEvents';
import { CalendarEvent } from '../../events/types';
import { toDateKey } from '../utils/dateUtils';
import { RootStackParamList } from '../../../app/types';
import { palette, radius, spacing, typography } from '../../../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const calendar = useCalendar();
  const markedDates = useMonthMarkers(calendar.viewDate);
  const { events, loading } = useDayEvents(calendar.selectedDate);

  const openEditor = (event?: CalendarEvent) => {
    navigation.navigate('EventEditor', {
      eventId: event?.id,
      dateKey: toDateKey(calendar.selectedDate),
    });
  };

  return (
    <Screen edges={['top']}>
      <CalendarHeader
        mode={calendar.mode}
        viewDate={calendar.viewDate}
        onPrev={calendar.goToPrev}
        onNext={calendar.goToNext}
        onToday={calendar.goToToday}
        onToggleMode={calendar.toggleMode}
      />

      <View style={styles.content}>
        {calendar.mode === 'month' ? (
          <MonthView
            viewDate={calendar.viewDate}
            selectedDate={calendar.selectedDate}
            markedDates={markedDates}
            onSelectDay={calendar.selectDay}
          />
        ) : (
          <DayView
            events={events}
            loading={loading}
            onPressEvent={openEditor}
          />
        )}
      </View>

      <Pressable
        onPress={() => openEditor()}
        style={styles.fab}
        testID="add-event-fab"
        accessibilityRole="button"
        accessibilityLabel="Add event">
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1 },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabIcon: { ...typography.h1, color: palette.textInverse, lineHeight: 34 },
});
