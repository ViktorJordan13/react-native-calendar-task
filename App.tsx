import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/providers/AuthProvider';
import { RootNavigator } from './src/app/RootNavigator';

/**
 * Provider composition root. Order matters:
 *  - GestureHandlerRootView must wrap everything (navigation gestures).
 *  - SafeAreaProvider exposes insets to the Screen component (notch handling).
 *  - AuthProvider owns session state that RootNavigator reads.
 */
const App: React.FC = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default App;
