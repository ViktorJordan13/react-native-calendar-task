/**
 * Firebase entry point.
 *
 * With @react-native-firebase, native config is read from the platform files
 * (android/app/google-services.json and ios/GoogleService-Info.plist), so there
 * is no JS-side API key to commit. We only re-export the typed module instances
 * here, giving the rest of the app a single import surface and making the
 * backend swappable behind the service layer.
 */
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const firebaseAuth = auth();
export const db = firestore();

export const EVENTS_COLLECTION = 'events';
