import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { EventEditorScreen } from '../features/events/screens/EventEditorScreen';
import { useAuth } from '../providers/AuthProvider';
import { palette } from '../theme';

const RootStack = createNativeStackNavigator<RootStackParamList>();

/**
 * Top-level routing. Auth state — not imperative navigation — decides which
 * tree renders. When `user` flips null<->set, React Navigation swaps the
 * entire subtree, and native-stack animates the transition for free.
 */
export const RootNavigator: React.FC = () => {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <RootStack.Screen name="AppTabs" component={AppNavigator} />
            <RootStack.Screen
              name="EventEditor"
              component={EventEditorScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
          </>
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.background,
  },
});
