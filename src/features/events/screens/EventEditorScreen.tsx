import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../../components/Screen';
import { Header } from '../../../components/Header';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { useAuth } from '../../../providers/AuthProvider';
import { eventsService } from '../services/eventsService';
import { eventSchema, EventFormValues } from '../validation/eventSchema';
import { toTimeLabel, formatFullDate } from '../../calendar/utils/dateUtils';
import { RootStackParamList } from '../../../app/types';
import { palette, radius, spacing, typography } from '../../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EventEditor'>;

/** Builds a default start (next rounded hour) and end (+1h) for the given day. */
const defaultTimes = (dateKey: string) => {
  const base = new Date(`${dateKey}T00:00:00`);
  const now = new Date();
  base.setHours(now.getHours() + 1, 0, 0, 0);
  const end = new Date(base);
  end.setHours(end.getHours() + 1);
  return { startISO: base.toISOString(), endISO: end.toISOString() };
};

export const EventEditorScreen: React.FC<Props> = ({ route, navigation }) => {
  const { user } = useAuth();
  const eventId = route.params?.eventId;
  const dateKey = route.params?.dateKey ?? '';
  const isEdit = !!eventId;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState<null | 'start' | 'end'>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: { title: '', description: '', ...defaultTimes(dateKey) },
  });

  const startISO = watch('startISO');
  const endISO = watch('endISO');

  useEffect(() => {
    if (!isEdit || !eventId) return;
    (async () => {
      const existing = await eventsService.getById(eventId);
      if (existing) {
        reset({
          title: existing.title,
          description: existing.description,
          startISO: existing.startISO,
          endISO: existing.endISO,
        });
      }
      setLoading(false);
    })();
  }, [eventId, isEdit, reset]);

  const onSave = async (values: EventFormValues) => {
    if (!user) return;
    setSaving(true);
    try {
      if (isEdit && eventId) {
        await eventsService.update(eventId, values);
      } else {
        await eventsService.create(user.uid, values);
      }
      navigation.goBack();
    } catch {
      Alert.alert('Save failed', 'Could not save the event. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = () => {
    if (!eventId) return;
    Alert.alert('Delete event', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await eventsService.remove(eventId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={palette.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header
        title={isEdit ? 'Edit meeting' : 'New meeting'}
        subtitle={dateKey ? formatFullDate(new Date(`${dateKey}T00:00:00`)) : undefined}
        leftLabel="Cancel"
        onLeftPress={() => navigation.goBack()}
        rightLabel="Save"
        onRightPress={handleSubmit(onSave)}
        rightDisabled={saving}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Title"
              testID="event-title"
              placeholder="Meeting with team"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.title?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Description"
              testID="event-description"
              placeholder="Agenda, location, notes…"
              multiline
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.description?.message}
              style={styles.multiline}
            />
          )}
        />

        <View style={styles.timeRow}>
          <TimeField
            label="Starts"
            value={toTimeLabel(new Date(startISO))}
            onPress={() => setPicker('start')}
          />
          <TimeField
            label="Ends"
            value={toTimeLabel(new Date(endISO))}
            onPress={() => setPicker('end')}
            error={errors.endISO?.message}
          />
        </View>

        {picker && (
          <DateTimePicker
            mode="time"
            value={new Date(picker === 'start' ? startISO : endISO)}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, date) => {
              setPicker(Platform.OS === 'ios' ? picker : null);
              if (date) {
                const target = picker === 'start' ? 'startISO' : 'endISO';
                // Preserve the selected day, change only time.
                const base = new Date(`${dateKey}T00:00:00`);
                base.setHours(date.getHours(), date.getMinutes(), 0, 0);
                setValue(target, base.toISOString(), { shouldValidate: true });
              }
            }}
          />
        )}

        {isEdit && (
          <Button
            label="Delete meeting"
            variant="danger"
            onPress={onDelete}
            style={styles.delete}
            testID="event-delete"
          />
        )}
      </ScrollView>
    </Screen>
  );
};

const TimeField: React.FC<{
  label: string;
  value: string;
  onPress: () => void;
  error?: string;
}> = ({ label, value, onPress, error }) => (
  <View style={styles.timeField}>
    <Text style={styles.timeLabel}>{label}</Text>
    <Pressable onPress={onPress} style={[styles.timeBox, !!error && styles.timeBoxError]}>
      <Text style={styles.timeValue}>{value}</Text>
    </Pressable>
    {!!error && <Text style={styles.timeError}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  multiline: { height: 100, paddingTop: spacing.sm, textAlignVertical: 'top' },
  timeRow: { flexDirection: 'row', gap: spacing.md },
  timeField: { flex: 1 },
  timeLabel: { ...typography.label, color: palette.text, marginBottom: spacing.xs },
  timeBox: {
    height: 52,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    backgroundColor: palette.surface,
  },
  timeBoxError: { borderColor: palette.danger },
  timeValue: { ...typography.body, color: palette.text },
  timeError: { ...typography.caption, color: palette.danger, marginTop: spacing.xs },
  delete: { marginTop: spacing.xl },
});
