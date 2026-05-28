/* eslint-disable no-undef */
/**
 * Jest setup. Native modules have no JS implementation under Jest, so we mock
 * them here. This lets us unit-test pure logic and component behavior without
 * a device.
 */

// --- Firebase Auth ---
jest.mock('@react-native-firebase/auth', () => {
  const authInstance = {
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(() => jest.fn()),
    currentUser: null,
  };
  return () => authInstance;
});

// --- Firebase Firestore ---
jest.mock('@react-native-firebase/firestore', () => {
  const firestoreInstance = {
    collection: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      onSnapshot: jest.fn(() => jest.fn()),
      add: jest.fn(),
      doc: jest.fn(() => ({
        get: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })),
    })),
  };
  return () => firestoreInstance;
});

// --- Biometrics ---
jest.mock('react-native-biometrics', () => {
  const BiometryTypes = { FaceID: 'FaceID', TouchID: 'TouchID', Biometrics: 'Biometrics' };
  return {
    __esModule: true,
    BiometryTypes,
    default: jest.fn().mockImplementation(() => ({
      isSensorAvailable: jest.fn().mockResolvedValue({ available: true, biometryType: 'FaceID' }),
      simplePrompt: jest.fn().mockResolvedValue({ success: true }),
    })),
  };
});

// --- Keychain ---
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn().mockResolvedValue(true),
  getGenericPassword: jest.fn().mockResolvedValue(false),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
  ACCESS_CONTROL: { BIOMETRY_ANY_OR_DEVICE_PASSCODE: 'mock' },
  ACCESSIBLE: { WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'mock' },
}));

// --- DateTimePicker ---
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// --- Gesture handler ---
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return { GestureHandlerRootView: View };
});
