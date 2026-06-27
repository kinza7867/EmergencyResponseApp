// App.tsx
// Root component — wraps the entire app with required providers in the correct order:
//   GestureHandlerRootView  (required by @react-navigation/stack)
//   SafeAreaProvider        (required by react-native-safe-area-context)
//   AuthProvider            (app-wide auth state)
//   AppNavigator            (all screens + navigation logic)

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}