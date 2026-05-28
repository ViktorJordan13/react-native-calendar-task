import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '../../../components/Screen';
import { Header } from '../../../components/Header';
import { Button } from '../../../components/Button';
import { useAuth } from '../../../providers/AuthProvider';
import { biometricsService } from '../../auth/services/biometrics';
import { palette, radius, spacing, typography } from '../../../theme';

export const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [bioEnabled, setBioEnabled] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    biometricsService.hasBiometricSession().then(setBioEnabled);
  }, []);

  const onLogout = async () => {
    setSigningOut(true);
    try {
      await signOut();
      // RootNavigator swaps to the Auth stack automatically on user -> null.
    } finally {
      setSigningOut(false);
    }
  };

  const initial = (user?.email ?? '?').charAt(0).toUpperCase();

  return (
    <Screen edges={['top']}>
      <Header title="Profile" />

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.email}>{user?.email ?? 'Unknown user'}</Text>
        <Text style={styles.uid}>ID: {user?.uid?.slice(0, 12)}…</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Biometric unlock</Text>
        <Text style={styles.infoValue}>{bioEnabled ? 'Enabled' : 'Off'}</Text>
      </View>

      <Button
        label="Log out"
        variant="danger"
        onPress={onLogout}
        loading={signingOut}
        testID="logout-button"
        style={styles.logout}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { ...typography.h1, color: palette.primary },
  email: { ...typography.h3, color: palette.text },
  uid: { ...typography.caption, color: palette.textMuted },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: palette.border,
  },
  infoLabel: { ...typography.body, color: palette.text },
  infoValue: { ...typography.body, color: palette.textMuted },
  logout: { marginTop: 'auto', marginBottom: spacing.lg },
});
