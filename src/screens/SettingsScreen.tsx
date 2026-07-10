// src/screens/SettingsScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  Vibration,
  Animated,
  StatusBar,
  Switch,
  Linking,
  Platform,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
//import * as Notifications from 'expo-notifications';

const LOGO = require('../../assets/logo.png');
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 380;

interface SettingsSection {
  id: string;
  title: string;
  icon: string;
  items: SettingsItem[];
}

interface SettingsItem {
  id: string;
  label: string;
  icon: string;
  type: 'toggle' | 'action' | 'navigation';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  color?: string;
}

export const SettingsScreen = ({ navigation }: any) => {
  const { user, signOut } = useAuth();
  
  // States
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(false);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setPushNotifications(settings.pushNotifications ?? true);
        setLocationServices(settings.locationServices ?? false);
        setEmergencyAlerts(settings.emergencyAlerts ?? true);
        setSoundEnabled(settings.soundEnabled ?? true);
        setVibrationEnabled(settings.vibrationEnabled ?? true);
        setDarkMode(settings.darkMode ?? false);
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        pushNotifications,
        locationServices,
        emergencyAlerts,
        soundEnabled,
        vibrationEnabled,
        darkMode,
      };
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const handleToggle = (setting: string, value: boolean) => {
    Vibration.vibrate(20);
    switch(setting) {
      case 'pushNotifications':
        setPushNotifications(value);
        break;
      case 'locationServices':
        setLocationServices(value);
        break;
      case 'emergencyAlerts':
        setEmergencyAlerts(value);
        break;
      case 'soundEnabled':
        setSoundEnabled(value);
        break;
      case 'vibrationEnabled':
        setVibrationEnabled(value);
        break;
      case 'darkMode':
        setDarkMode(value);
        break;
    }
    saveSettings();
  };

  const handleLogout = () => {
    Vibration.vibrate(30);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            await signOut();
            navigation.replace('Login');
          }
        },
      ]
    );
  };

  const handleClearData = () => {
    Vibration.vibrate(30);
    Alert.alert(
      'Clear App Data',
      'This will clear all your app data including saved settings and cache. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Data', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'App data cleared successfully.');
              // Reset to default settings
              setPushNotifications(true);
              setLocationServices(false);
              setEmergencyAlerts(true);
              setSoundEnabled(true);
              setVibrationEnabled(true);
              setDarkMode(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear app data.');
            }
          }
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Vibration.vibrate(20);
    Linking.openURL('mailto:support@emergencyresponse.com').catch(() => {
      Alert.alert('Error', 'Unable to open email. Please contact support@emergencyresponse.com');
    });
  };

  const handleRateApp = () => {
    Vibration.vibrate(20);
    const url = Platform.OS === 'ios' 
      ? 'itms-apps://itunes.apple.com/app/id123456789' 
      : 'market://details?id=com.emergencyresponse.app';
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open app store.');
    });
  };

  const handleShareApp = async () => {
    Vibration.vibrate(20);
    try {
      await Share.share({
        message: '🚨 Emergency Response App - Get help instantly! Download now from the App Store.\n\nJoin the emergency response network today!',
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share app.');
    }
  };

  const handlePrivacyPolicy = () => {
    Vibration.vibrate(20);
    Linking.openURL('https://www.emergencyresponse.com/privacy').catch(() => {
      Alert.alert('Error', 'Unable to open privacy policy.');
    });
  };

  const handleTermsOfService = () => {
    Vibration.vibrate(20);
    Linking.openURL('https://www.emergencyresponse.com/terms').catch(() => {
      Alert.alert('Error', 'Unable to open terms of service.');
    });
  };

  const getVersion = () => {
    return '1.0.0';
  };

  const getUserName = () => {
    if (user && user.name) {
      return user.name;
    }
    return 'User';
  };

  const getUserEmail = () => {
    if (user && user.email) {
      return user.email;
    }
    return 'user@email.com';
  };

  const getUserInitials = () => {
    const name = getUserName();
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Settings sections
  const settingsSections: SettingsSection[] = [
    {
      id: 'preferences',
      title: 'Preferences',
      icon: 'settings',
      items: [
        {
          id: 'darkMode',
          label: 'Dark Mode',
          icon: 'moon',
          type: 'toggle',
          value: darkMode,
          onToggle: (value) => handleToggle('darkMode', value),
        },
        {
          id: 'soundEnabled',
          label: 'Sound Effects',
          icon: 'volume-high',
          type: 'toggle',
          value: soundEnabled,
          onToggle: (value) => handleToggle('soundEnabled', value),
        },
        {
          id: 'vibrationEnabled',
          label: 'Vibration',
          icon: 'phone-vibrate',
          type: 'toggle',
          value: vibrationEnabled,
          onToggle: (value) => handleToggle('vibrationEnabled', value),
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications',
      items: [
        {
          id: 'pushNotifications',
          label: 'Push Notifications',
          icon: 'notifications',
          type: 'toggle',
          value: pushNotifications,
          onToggle: (value) => handleToggle('pushNotifications', value),
        },
        {
          id: 'emergencyAlerts',
          label: 'Emergency Alerts',
          icon: 'alert-circle',
          type: 'toggle',
          value: emergencyAlerts,
          onToggle: (value) => handleToggle('emergencyAlerts', value),
        },
        {
          id: 'locationServices',
          label: 'Location Services',
          icon: 'location',
          type: 'toggle',
          value: locationServices,
          onToggle: (value) => handleToggle('locationServices', value),
        },
      ],
    },
    {
      id: 'account',
      title: 'Account',
      icon: 'person',
      items: [
        {
          id: 'profile',
          label: 'Edit Profile',
          icon: 'person',
          type: 'navigation',
          onPress: () => navigation.navigate('EditProfile'),
        },
        {
          id: 'emergency_contacts',
          label: 'Emergency Contacts',
          icon: 'people',
          type: 'navigation',
          onPress: () => navigation.navigate('EmergencyContacts'),
        },
        {
          id: 'clear_data',
          label: 'Clear App Data',
          icon: 'trash',
          type: 'action',
          color: '#DC2626',
          onPress: handleClearData,
        },
        {
          id: 'logout',
          label: 'Logout',
          icon: 'log-out',
          type: 'action',
          color: '#DC2626',
          onPress: handleLogout,
        },
      ],
    },
    {
      id: 'support',
      title: 'Support',
      icon: 'help',
      items: [
        {
          id: 'contact_support',
          label: 'Contact Support',
          icon: 'chatbubbles',
          type: 'action',
          onPress: handleContactSupport,
        },
        {
          id: 'rate_app',
          label: 'Rate App',
          icon: 'star',
          type: 'action',
          onPress: handleRateApp,
        },
        {
          id: 'share_app',
          label: 'Share App',
          icon: 'share',
          type: 'action',
          onPress: handleShareApp,
        },
        {
          id: 'privacy_policy',
          label: 'Privacy Policy',
          icon: 'shield',
          type: 'action',
          onPress: handlePrivacyPolicy,
        },
        {
          id: 'terms_of_service',
          label: 'Terms of Service',
          icon: 'document-text',
          type: 'action',
          onPress: handleTermsOfService,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingsItem) => {
    switch(item.type) {
      case 'toggle':
        return (
          <View style={styles.settingItem} key={item.id}>
            <View style={styles.settingItemLeft}>
              <Ionicons name={item.icon as any} size={22} color={item.color || '#6B7280'} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>{item.label}</Text>
            </View>
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: '#E5E7EB', true: '#DC2626' }}
              thumbColor="#FFFFFF"
            />
          </View>
        );
      case 'navigation':
        return (
          <TouchableOpacity
            style={styles.settingItem}
            key={item.id}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <Ionicons name={item.icon as any} size={22} color={item.color || '#6B7280'} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        );
      case 'action':
        return (
          <TouchableOpacity
            style={styles.settingItem}
            key={item.id}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <Ionicons name={item.icon as any} size={22} color={item.color || '#6B7280'} style={styles.settingIcon} />
              <Text style={[styles.settingLabel, item.color && { color: item.color }]}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />

      {/* Header */}
      <LinearGradient
        colors={['#DC2626', '#991B1B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image source={LOGO} style={styles.headerLogo} resizeMode="contain" />
            <Text style={styles.headerTitle}>Settings</Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              Vibration.vibrate(20);
              saveSettings();
              Alert.alert('Settings Saved', 'Your settings have been saved successfully.');
            }}
            activeOpacity={0.7}
            style={styles.saveButton}
          >
            <Ionicons name="checkmark" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* User Profile Card */}
          <View style={styles.profileCard}>
            <TouchableOpacity
              style={styles.profileContent}
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.7}
            >
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>{getUserInitials()}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{getUserName()}</Text>
                <Text style={styles.profileEmail}>{getUserEmail()}</Text>
                <Text style={styles.profileVersion}>Version {getVersion()}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
            </TouchableOpacity>
          </View>

          {/* Settings Sections */}
          {settingsSections.map((section) => (
            <View key={section.id} style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons name={section.icon as any} size={20} color="#DC2626" />
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <View style={styles.sectionCard}>
                {section.items.map((item) => renderSettingItem(item))}
              </View>
            </View>
          ))}

          {/* App Info */}
          <View style={styles.appInfoContainer}>
            <Text style={styles.appInfoText}>
              Emergency Response App v{getVersion()}
            </Text>
            <Text style={styles.appInfoSubtext}>
              © 2024 Emergency Response. All rights reserved.
            </Text>
            <View style={styles.appInfoLinks}>
              <TouchableOpacity onPress={handlePrivacyPolicy} activeOpacity={0.7}>
                <Text style={styles.appInfoLink}>Privacy Policy</Text>
              </TouchableOpacity>
              <View style={styles.appInfoDivider} />
              <TouchableOpacity onPress={handleTermsOfService} activeOpacity={0.7}>
                <Text style={styles.appInfoLink}>Terms of Service</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 36,
    height: 36,
    marginRight: 8,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveButton: {
    padding: 4,
  },

  // Content
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  contentContainer: {
    paddingTop: 16,
  },

  // Profile Card
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  profileEmail: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#6B7280',
    marginTop: 2,
  },
  profileVersion: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#9CA3AF',
    marginTop: 2,
  },

  // Sections
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
    width: 22,
  },
  settingLabel: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#1F2937',
    flex: 1,
  },

  // App Info
  appInfoContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 8,
  },
  appInfoText: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#6B7280',
  },
  appInfoSubtext: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  appInfoLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  appInfoLink: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#DC2626',
    fontWeight: '500',
  },
  appInfoDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
});

export default SettingsScreen;