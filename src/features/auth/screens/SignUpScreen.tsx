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
import { authService } from '../services/authService';
import { biometricsService } from '../services/biometrics';
import { signUpSchema, SignUpValues } from '../validation/authSchema';
import { AuthStackParamList } from '../../../app/types';
import { palette, spacing, typography } from '../../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: SignUpValues) => {
    setSubmitting(true);
    try {
      await signUp(values.email, values.password);
      // Offer to enable biometric unlock for future logins.
      const cap = await biometricsService.getCapability();
      if (cap.available) {
        Alert.alert(
          'Enable quick unlock?',
          `Use ${cap.type ?? 'biometrics'} to sign in next time.`,
          [
            { text: 'Not now', style: 'cancel' },
            {
              text: 'Enable',
              onPress: () => biometricsService.enableBiometricSession(values.email),
            },
          ],
        );
      }
    } catch (e: any) {
      Alert.alert('Sign up failed', authService.humanizeError(e?.code ?? ''));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Header
        title="Create account"
        subtitle="Get started in seconds"
        leftLabel="Back"
        onLeftPress={() => navigation.goBack()}
      />
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
                testID="signup-email"
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
                testID="signup-password"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          <Button
            label="Sign Up"
            testID="signup-submit"
            onPress={handleSubmit(onSubmit)}
            loading={submitting}
          />
        </View>

        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.footer}>
          <Text style={styles.footerText}>
            Already registered? <Text style={styles.footerLink}>Sign in</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { marginTop: spacing.lg },
  footer: { marginTop: 'auto', paddingVertical: spacing.lg, alignItems: 'center' },
  footerText: { ...typography.body, color: palette.textMuted },
  footerLink: { color: palette.primary, fontWeight: '600' },
});
