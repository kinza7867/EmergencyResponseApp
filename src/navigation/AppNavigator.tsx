// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';

// Auth Screens
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';

// Main Screens
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SOSScreen } from '../screens/SOSScreen';
import { RequestHistoryScreen } from '../screens/RequestHistoryScreen';

// Other Screens
import { InstantAssistanceScreen } from '../screens/InstantAssistanceScreen';
import { ConfirmationScreen } from '../screens/ConfirmationScreen';
import { TrackingScreen } from '../screens/TrackingScreen';
import { RequestDetailsScreen } from '../screens/RequestDetailsScreen';
import { HospitalSelectionScreen } from '../screens/HospitalSelectionScreen';
import { HospitalDetailsScreen } from '../screens/HospitalDetailsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { EmergencyContactsScreen } from '../screens/EmergencyContactsScreen';
import { AddContactScreen } from '../screens/AddContactScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { EmergencySuccessScreen } from '../screens/EmergencySuccessScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#DC2626',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingBottom: 4,
        paddingTop: 4,
        height: 60,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '500',
      },
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: any = 'home';
        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'SOS') {
          iconName = focused ? 'alert-circle' : 'alert-circle-outline';
        } else if (route.name === 'History') {
          iconName = focused ? 'time' : 'time-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="SOS" component={SOSScreen} />
    <Tab.Screen name="History" component={RequestHistoryScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Main App Navigator
export const AppNavigator = () => {
  const { userToken, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#F5F5F5' },
        }}
      >
        {userToken ? (
          // Authenticated Stack
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            
            {/* Emergency Screens */}
            <Stack.Screen name="InstantAssistance" component={InstantAssistanceScreen} />
            <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
            <Stack.Screen name="EmergencySuccess" component={EmergencySuccessScreen} />
            
            {/* History Screens */}
            <Stack.Screen name="RequestHistory" component={RequestHistoryScreen} />
            <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
            
            {/* Tracking Screens */}
            <Stack.Screen name="Tracking" component={TrackingScreen} />
            
            {/* Hospital Screens */}
            <Stack.Screen name="HospitalSelection" component={HospitalSelectionScreen} />
            <Stack.Screen name="HospitalDetails" component={HospitalDetailsScreen} />
            
            {/* Settings Screens */}
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            
            {/* Contacts Screens */}
            <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
            <Stack.Screen name="AddContact" component={AddContactScreen} />
            
            {/* Profile Screens */}
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            
            {/* Auth Screens (for navigation from within app) */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          // Unauthenticated Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="InstantAssistance" component={InstantAssistanceScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
});

export default AppNavigator;