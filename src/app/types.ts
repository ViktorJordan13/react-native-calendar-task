import { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Centralized, typed route params. Importing these everywhere gives us
 * autocomplete + compile-time safety on navigation.navigate() calls — a
 * standard senior-level pattern with React Navigation + TypeScript.
 */

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type AppTabParamList = {
  Calendar: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  AppTabs: NavigatorScreenParams<AppTabParamList>;
  // Modal-style editor pushed above the tabs.
  EventEditor: { eventId?: string; dateKey: string } | undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
