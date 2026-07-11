// src/navigation/MainNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

// Main Tab Screens
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { HistoryScreen } from '../screens/HistoryScreen';

// Other Screens
import { InstantAssistanceScreen } from '../screens/InstantAssistanceScreen';
import { ConfirmationScreen } from '../screens/ConfirmationScreen';
import { TrackingScreen } from '../screens/TrackingScreen';
import { RequestDetailsScreen } from '../screens/RequestDetailsScreen';
import { HospitalSelectionScreen } from '../screens/HospitalSelectionScreen';
import { HospitalDetailsScreen } from '../screens/HospitalDetailsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { EmergencyContactsScreen } from '../screens/EmergencyContactsScreen';
import { AddContactScreen } from '../screens/AddContactScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { EmergencySuccessScreen } from '../screens/EmergencySuccessScreen';
import { RequestHistoryScreen } from '../screens/RequestHistoryScreen';
import { SOSScreen } from '../screens/SOSScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const { width } = Dimensions.get('window');
const isSmallDevice = width < 380;

// Custom Tab Bar Item Component with theme support
const TabBarIcon = ({ focused, route, color, size, isDarkMode }: any) => {
  let iconName: any = 'home';
  let label = 'Home';
  
  if (route.name === 'Home') {
    iconName = focused ? 'home' : 'home-outline';
    label = 'Home';
  } else if (route.name === 'History') {
    iconName = focused ? 'time' : 'time-outline';
    label = 'History';
  } else if (route.name === 'Settings') {
    iconName = focused ? 'settings' : 'settings-outline';
    label = 'Settings';
  } else if (route.name === 'Profile') {
    iconName = focused ? 'person' : 'person-outline';
    label = 'Profile';
  }

  const iconSize = isSmallDevice ? 22 : 26;
  
  // Colors based on theme
  const activeBgColor = '#DC2626';
  const inactiveTextColor = isDarkMode ? '#8B8BA3' : '#9CA3AF';
  const activeTextColor = isDarkMode ? '#FFFFFF' : '#DC2626';
  
  return (
    <View style={styles.tabItemContainer}>
      <View style={[
        styles.tabIconWrapper,
        focused && { backgroundColor: activeBgColor }
      ]}>
        <Ionicons 
          name={iconName} 
          size={iconSize} 
          color={focused ? '#FFFFFF' : color} 
        />
      </View>
      {focused && <View style={[styles.tabIndicator, { backgroundColor: activeTextColor }]} />}
      <Text style={[
        styles.tabLabel, 
        { color: focused ? activeTextColor : inactiveTextColor }
      ]}>
        {label}
      </Text>
    </View>
  );
};

// Bottom Tab Navigator with Custom Tab Bar
const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const { isDarkMode, colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#DC2626',
        tabBarInactiveTintColor: isDarkMode ? '#8B8BA3' : '#9CA3AF',
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1A1A2E' : '#FFFFFF',
          borderTopWidth: 0,
          elevation: 15,
          shadowColor: isDarkMode ? '#000' : '#000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: isDarkMode ? 0.4 : 0.1,
          shadowRadius: 16,
          height: Platform.OS === 'ios' ? 80 : 70,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 8,
          paddingHorizontal: 8,
        },
        tabBarLabel: () => null,
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon 
            focused={focused} 
            route={route} 
            color={color} 
            size={size} 
            isDarkMode={isDarkMode}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Main Navigator
const MainNavigator = () => {
  const { isDarkMode, colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: isDarkMode ? '#0F0F1A' : '#F5F5F5' },
      }}
    >
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      
      <Stack.Screen name="InstantAssistance" component={InstantAssistanceScreen} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
      <Stack.Screen name="EmergencySuccess" component={EmergencySuccessScreen} />
      <Stack.Screen name="RequestHistory" component={RequestHistoryScreen} />
      <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
      <Stack.Screen name="Tracking" component={TrackingScreen} />
      <Stack.Screen name="HospitalSelection" component={HospitalSelectionScreen} />
      <Stack.Screen name="HospitalDetails" component={HospitalDetailsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
      <Stack.Screen name="AddContact" component={AddContactScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="SOS" component={SOSScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  tabIndicator: {
    position: 'absolute',
    top: -4,
    width: 20,
    height: 3,
    borderRadius: 2,
  },
  tabLabel: {
    fontSize: isSmallDevice ? 9 : 11,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default MainNavigator;