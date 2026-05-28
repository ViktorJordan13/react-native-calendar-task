import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../../components/Screen';
import { Header } from '../../../components/Header';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { useAuth } from '../../../providers/AuthProvider';
import { useBiometricLogin } from '../hooks/useBiometricLogin';
import { authService } from '../services/authService';
import { signInSchema, SignInValues } from '../validation/authSchema';
import { AuthStackParamList } from '../../../app/types';
import { palette, spacing, typography } from '../../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

export const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const { signIn } = useAuth();
  const { canUseBiometrics, promptLabel, unlock } = useBiometricLogin();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: SignInValues) => {
    setSubmitting(true);
    try {
      await signIn(values.email, values.password);
      // AuthProvider state flip triggers navigation automatically.
    } catch (e: any) {
      Alert.alert('Sign in failed', authService.humanizeError(e?.code ?? ''));
    } finally {
      setSubmitting(false);
    }
  };

  const onBiometricUnlock = async () => {
    try {
      const email = await unlock();
      if (!email) return; // user cancelled
      // Firebase persists the session; if still valid, onAuthStateChanged has
      // already restored `user`. This path handles re-affirming intent.
      const current = authService.getCurrentUser();
      if (!current) {
        Alert.alert(
          'Session expired',
          'Please sign in with your password once more.',
        );
      }
    } catch {
      Alert.alert('Unlock failed', 'Could not verify biometrics.');
    }
  };

  return (
    <Screen>
      <Header title="Welcome back" subtitle="Sign in to your calendar" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                testID="signin-email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                testID="signin-password"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          <Button
            label="Sign In"
            testID="signin-submit"
            onPress={handleSubmit(onSubmit)}
            loading={submitting}
          />

          {canUseBiometrics && (
            <Button
              label={promptLabel}
              variant="secondary"
              onPress={onBiometricUnlock}
              style={styles.bioButton}
            />
          )}
        </View>

        <Pressable
          onPress={() => navigation.navigate('SignUp')}
          style={styles.footer}>
          <Text style={styles.footerText}>
            No account? <Text style={styles.footerLink}>Sign up</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { marginTop: spacing.lg },
  bioButton: { marginTop: spacing.md },
  footer: { marginTop: 'auto', paddingVertical: spacing.lg, alignItems: 'center' },
  footerText: { ...typography.body, color: palette.textMuted },
  footerLink: { color: palette.primary, fontWeight: '600' },
});
