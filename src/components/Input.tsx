import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { palette, radius, spacing, typography } from '../theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  testID?: string;
}

/**
 * Controlled input primitive. Error rendering lives here so screens stay
 * declarative — they just pass the error string from the form layer.
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  testID,
  ...rest
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        testID={testID}
        placeholderTextColor={palette.textMuted}
        style={[styles.input, !!error && styles.inputError]}
        {...rest}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    color: palette.text,
    marginBottom: spacing.xs,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.surface,
    color: palette.text,
    ...typography.body,
  },
  inputError: {
    borderColor: palette.danger,
  },
  error: {
    ...typography.caption,
    color: palette.danger,
    marginTop: spacing.xs,
  },
});
