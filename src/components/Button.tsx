import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { palette, radius, spacing, typography } from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  testID,
}) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? palette.textInverse : palette.primary}
        />
      ) : (
        <Text style={[styles.label, labelColor(variant)]}>{label}</Text>
      )}
    </Pressable>
  );
};

const labelColor = (variant: Variant): { color: string } => {
  switch (variant) {
    case 'primary':
    case 'danger':
      return { color: palette.textInverse };
    case 'secondary':
    case 'ghost':
      return { color: palette.primary };
  }
};

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primary: { backgroundColor: palette.primary },
  danger: { backgroundColor: palette.danger },
  secondary: {
    backgroundColor: palette.primaryLight,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  label: { ...typography.bodyBold },
});
