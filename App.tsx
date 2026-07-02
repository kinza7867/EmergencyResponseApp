// App.tsx
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';  // ← ADD THIS
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>           {/* ← ADD THIS */}
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </ThemeProvider>          {/* ← ADD THIS */}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}