import { useCallback, useEffect, useState } from 'react';
import { biometricsService, BiometricCapability } from '../services/biometrics';

/**
 * Encapsulates biometric availability + unlock so the SignIn screen stays
 * declarative. Returns whether a previous biometric session exists (controls
 * showing the "Unlock with Face ID" button) and the unlock handler.
 */
export const useBiometricLogin = () => {
  const [capability, setCapability] = useState<BiometricCapability>({
    available: false,
    type: null,
  });
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const cap = await biometricsService.getCapability();
      const session = await biometricsService.hasBiometricSession();
      if (active) {
        setCapability(cap);
        setHasSession(session);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const unlock = useCallback(async (): Promise<string | null> => {
    return biometricsService.unlockWithBiometrics();
  }, []);

  const promptLabel =
    capability.type === 'FaceID'
      ? 'Unlock with Face ID'
      : capability.type === 'TouchID'
      ? 'Unlock with Touch ID'
      : 'Unlock with Biometrics';

  return {
    canUseBiometrics: capability.available && hasSession,
    promptLabel,
    unlock,
  };
};
