/**
 * Biometrics service.
 *
 * DESIGN DECISION: Biometrics is treated as a *session unlock*, not as
 * primary authentication. The correct pattern:
 *   1. User signs in with email/password (real Firebase auth).
 *   2. On success, if the device supports biometrics, we store a flag +
 *      credentials reference in the Keychain (hardware-backed secure storage).
 *   3. On next launch, if a biometric session exists, the user can unlock with
 *      Face ID / Touch ID / fingerprint instead of retyping the password.
 *
 * We never store the raw password in plaintext anywhere accessible — it lives
 * in the OS Keychain/Keystore, released only after a successful biometric prompt.
 */
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';

const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: true, // fall back to PIN/pattern if no biometric enrolled
});

const BIOMETRIC_SERVICE = 'com.rncalendar.biometric-session';

export interface BiometricCapability {
  available: boolean;
  type: 'FaceID' | 'TouchID' | 'Biometrics' | null;
}

export const biometricsService = {
  async getCapability(): Promise<BiometricCapability> {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    let type: BiometricCapability['type'] = null;
    if (biometryType === BiometryTypes.FaceID) type = 'FaceID';
    else if (biometryType === BiometryTypes.TouchID) type = 'TouchID';
    else if (biometryType === BiometryTypes.Biometrics) type = 'Biometrics';
    return { available, type };
  },

  /**
   * Persist the session after a successful password login. We store the email
   * so the unlock flow knows which account to restore; the actual auth token is
   * managed by Firebase's own persistence. Keychain access is gated behind a
   * biometric prompt on read.
   */
  async enableBiometricSession(email: string): Promise<boolean> {
    const { available } = await this.getCapability();
    if (!available) return false;

    await Keychain.setGenericPassword('session', email, {
      service: BIOMETRIC_SERVICE,
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return true;
  },

  async hasBiometricSession(): Promise<boolean> {
    const creds = await Keychain.getGenericPassword({ service: BIOMETRIC_SERVICE });
    return creds !== false;
  },

  /**
   * Prompts for biometric auth. On success, returns the stored email so the
   * app can confirm the Firebase session is still valid and route to the
   * calendar. Throws / returns null if the user cancels or fails.
   */
  async unlockWithBiometrics(): Promise<string | null> {
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: 'Unlock Calendar',
      cancelButtonText: 'Use password',
    });
    if (!success) return null;

    const creds = await Keychain.getGenericPassword({ service: BIOMETRIC_SERVICE });
    return creds ? creds.password : null;
  },

  async clearBiometricSession(): Promise<void> {
    await Keychain.resetGenericPassword({ service: BIOMETRIC_SERVICE });
  },
};
