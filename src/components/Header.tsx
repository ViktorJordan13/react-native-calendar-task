import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { palette, spacing, typography } from '../theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  /** Optional left action (e.g. back/cancel). */
  leftLabel?: string;
  onLeftPress?: () => void;
  /** Optional right action (e.g. save/add). */
  rightLabel?: string;
  onRightPress?: () => void;
  rightDisabled?: boolean;
}

/**
 * Shared header (the required "header"). Used across screens for a consistent
 * top bar; actions are passed in so it stays presentational and reusable.
 */
export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftLabel,
  onLeftPress,
  rightLabel,
  onRightPress,
  rightDisabled,
}) => (
  <View style={styles.container}>
    <View style={styles.side}>
      {leftLabel && (
        <Pressable onPress={onLeftPress} hitSlop={8}>
          <Text style={styles.action}>{leftLabel}</Text>
        </Pressable>
      )}
    </View>

    <View style={styles.center}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>

    <View style={[styles.side, styles.sideRight]}>
      {rightLabel && (
        <Pressable onPress={onRightPress} disabled={rightDisabled} hitSlop={8}>
          <Text style={[styles.action, rightDisabled && styles.actionDisabled]}>
            {rightLabel}
          </Text>
        </Pressable>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  side: { width: 72, justifyContent: 'center' },
  sideRight: { alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center' },
  title: { ...typography.h3, color: palette.text },
  subtitle: { ...typography.caption, color: palette.textMuted, marginTop: 2 },
  action: { ...typography.label, color: palette.primary },
  actionDisabled: { color: palette.textMuted },
});
