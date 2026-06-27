// src/navigation/AppNavigator.tsx
// All weeks navigation — Week 1: Login/Register/Auth, Week 2: SOS/Confirmation,
// Week 3: RequestHistory, Week 4: Tracking with GPS

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { LoginScreen }             from '../screens/LoginScreen';
import { ForgotPasswordScreen }    from '../screens/ForgotPasswordScreen';
import { InstantAssistanceScreen } from '../screens/InstantAssistanceScreen';
import { RegisterScreen }          from '../screens/RegisterScreen';
import { HomeScreen }              from '../screens/HomeScreen';
import { HistoryScreen }           from '../screens/HistoryScreen';
import { ProfileScreen }           from '../screens/ProfileScreen';
import { SOSScreen }               from '../screens/SOSScreen';
import { ConfirmationScreen }      from '../screens/ConfirmationScreen';
import { RequestHistoryScreen }    from '../screens/RequestHistoryScreen';
import { TrackingScreen }          from '../screens/TrackingScreen';
import { colors } from '../styles/theme';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primaryLight,
      tabBarInactiveTintColor: colors.tabInactive,
      tabBarStyle: { backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, paddingBottom: 4, paddingTop: 4, height: 60 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
    }}
  >
    <Tab.Screen name="Home"    component={HomeScreen}    options={{ tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>🏠</Text>, tabBarLabel: 'Home' }} />
    <Tab.Screen name="SOS"     component={SOSScreen}     options={{ tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>🆘</Text>, tabBarLabel: 'SOS' }} />
    <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>📋</Text>, tabBarLabel: 'History' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>👤</Text>, tabBarLabel: 'Profile' }} />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const { userToken, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryLight} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
        {userToken ? (
          <>
            <Stack.Screen name="Main"           component={TabNavigator} />
            <Stack.Screen name="Confirmation"   component={ConfirmationScreen} options={{ gestureEnabled: false }} />
            <Stack.Screen name="RequestHistory" component={RequestHistoryScreen} />
            <Stack.Screen name="Tracking"       component={TrackingScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login"             component={LoginScreen} />
            <Stack.Screen name="ForgotPassword"    component={ForgotPasswordScreen} />
            <Stack.Screen name="InstantAssistance" component={InstantAssistanceScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register"          component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText:      { marginTop: 12, fontSize: 14, color: colors.textSecondary },
});
