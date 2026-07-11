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
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGO = require('../../assets/logo.png');
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 380;

interface SettingsItem {
  id: string;
  label: string;
  icon: string;
  type: 'toggle' | 'action' | 'navigation';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  color?: string;
  description?: string;
}

interface SettingsSection {
  id: string;
  title: string;
  icon: string;
  items: SettingsItem[];
}

export const SettingsScreen = ({ navigation }: any) => {
  const { user, signOut } = useAuth();
  const { isDarkMode, setDarkMode, colors: themeColors } = useTheme();
  
  // States
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(false);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<{title: string; body: string; buttons?: any[]}>({
    title: '',
    body: '',
  });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const modalSlideAnim = useRef(new Animated.Value(height)).current;
  const modalFadeAnim = useRef(new Animated.Value(0)).current;

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
        setPushNotifications(settings.pushNotifications !== undefined ? settings.pushNotifications : true);
        setLocationServices(settings.locationServices !== undefined ? settings.locationServices : false);
        setEmergencyAlerts(settings.emergencyAlerts !== undefined ? settings.emergencyAlerts : true);
        setSoundEnabled(settings.soundEnabled !== undefined ? settings.soundEnabled : true);
        setVibrationEnabled(settings.vibrationEnabled !== undefined ? settings.vibrationEnabled : true);
        // Dark mode is managed by ThemeContext
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
        darkMode: isDarkMode,
      };
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
      return true;
    } catch (error) {
      console.log('Error saving settings:', error);
      return false;
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
              setPushNotifications(true);
              setLocationServices(false);
              setEmergencyAlerts(true);
              setSoundEnabled(true);
              setVibrationEnabled(true);
              setDarkMode(false);
              await saveSettings();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear app data.');
            }
          }
        },
      ]
    );
  };

  // Theme colors from ThemeContext
  const colors = {
    bg: isDarkMode ? '#0F0F1A' : '#F5F5F5',
    cardBg: isDarkMode ? '#2f2f38' : '#FFFFFF',
    cardBorder: isDarkMode ? '#2D2D44' : '#F3F4F6',
    textPrimary: isDarkMode ? '#FFFFFF' : '#1F2937',
    textSecondary: isDarkMode ? '#B0B0C8' : '#6B7280',
    textMuted: isDarkMode ? '#8B8BA3' : '#9CA3AF',
    iconColor: isDarkMode ? '#B0B0C8' : '#6B7280',
    iconBg: isDarkMode ? '#2D2D44' : '#F3F4F6',
    sectionIcon: '#DC2626',
    linkColor: '#DC2626',
    modalBg: isDarkMode ? '#1A1A2E' : '#FFFFFF',
    modalBorder: isDarkMode ? '#2D2D44' : '#F3F4F6',
    modalText: isDarkMode ? '#FFFFFF' : '#1F2937',
    modalSubtext: isDarkMode ? '#B0B0C8' : '#6B7280',
    modalButtonBg: '#DC2626',
    modalButtonText: '#FFFFFF',
  };

  // Modal functions
  const showModal = (title: string, body: string, buttons?: any[]) => {
    setModalContent({ title, body, buttons });
    setModalVisible(true);
    Animated.parallel([
      Animated.spring(modalSlideAnim, {
        toValue: 0,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(modalFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(modalSlideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(modalFadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
    });
  };

  // Support Functions with themed modals
  const handleFAQ = () => {
    Vibration.vibrate(20);
    showModal(
      'Frequently Asked Questions',
      '1. How do I send an SOS alert?\n   Tap the SOS button on the home screen.\n\n2. How do I add emergency contacts?\n   Go to Profile → Emergency Contacts.\n\n3. How do I share my location?\n   Enable Location Services in Settings.\n\n4. What should I do in an emergency?\n   Stay calm and call emergency services.\n\n5. How do I update my profile?\n   Go to Profile → Edit Profile.'
    );
  };

  const handleContactSupport = () => {
    Vibration.vibrate(20);
    showModal(
      'Contact Support',
      'Choose your preferred contact method:',
      [
        { 
          text: 'Email', 
          onPress: () => {
            closeModal();
            Linking.openURL('mailto:support@emergencyresponse.com').catch(() => {
              Alert.alert('Error', 'Unable to open email.');
            });
          }
        },
        { 
          text: 'Phone', 
          onPress: () => {
            closeModal();
            Linking.openURL('tel:+1234567890').catch(() => {
              Alert.alert('Error', 'Unable to make call.');
            });
          }
        },
        { text: 'Cancel', style: 'cancel', onPress: closeModal },
      ]
    );
  };

  const handleReportBug = () => {
    Vibration.vibrate(20);
    showModal(
      'Report a Bug',
      'Help us improve by reporting any issues:',
      [
        { 
          text: 'Email', 
          onPress: () => {
            closeModal();
            Linking.openURL('mailto:bugs@emergencyresponse.com?subject=Bug Report').catch(() => {
              Alert.alert('Error', 'Unable to open email.');
            });
          }
        },
        { 
          text: 'Describe', 
          onPress: () => {
            closeModal();
            showModal(
              'Bug Report Form',
              'Please describe the bug:\n\n1. What happened?\n2. When did it happen?\n3. How can we reproduce it?\n\nPlease email us at bugs@emergencyresponse.com'
            );
          }
        },
        { text: 'Cancel', style: 'cancel', onPress: closeModal },
      ]
    );
  };

  const handleRateApp = () => {
    Vibration.vibrate(20);
    showModal(
      'Rate the App',
      'Thank you for using Emergency Response App!',
      [
        { 
          text: 'Rate Now', 
          onPress: () => {
            closeModal();
            const url = Platform.OS === 'ios' 
              ? 'itms-apps://itunes.apple.com/app/id123456789' 
              : 'market://details?id=com.emergencyresponse.app';
            Linking.openURL(url).catch(() => {
              Alert.alert('Error', 'Unable to open app store.');
            });
          }
        },
        { text: 'Not Now', style: 'cancel', onPress: closeModal },
      ]
    );
  };

  const handleShareApp = async () => {
    Vibration.vibrate(20);
    try {
      await Share.share({
        message: 'Emergency Response App - Get help instantly! Download now from the App Store.\n\nJoin the emergency response network today!',
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share app.');
    }
  };

  const handlePrivacyPolicy = () => {
    Vibration.vibrate(20);
    showModal(
      'Privacy Policy',
      'Your privacy is important to us.\n\nWe collect minimal data to provide emergency services:\n\n• Location data (only during emergencies)\n• Contact information\n• Emergency contacts\n\nWe do not sell your data to third parties.\n\nFull policy available at:\nhttps://www.emergencyresponse.com/privacy'
    );
  };

  const handleTermsOfService = () => {
    Vibration.vibrate(20);
    showModal(
      'Terms of Service',
      'By using Emergency Response App, you agree to:\n\n• Use the app only for genuine emergencies\n• Provide accurate location information\n• Not misuse the SOS feature\n• Follow emergency responder instructions\n\nFull terms available at:\nhttps://www.emergencyresponse.com/terms'
    );
  };

  const getVersion = () => '1.0.0';

  const getUserName = () => user?.name || 'User';
  const getUserEmail = () => user?.email || 'user@email.com';

  const getUserInitials = () => {
    const name = getUserName();
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const settingsSections: SettingsSection[] = [
    {
      id: 'appearance',
      title: 'Appearance',
      icon: 'color-palette-outline',
      items: [
        {
          id: 'darkMode',
          label: 'Dark Mode',
          icon: 'moon-outline',
          type: 'toggle',
          value: isDarkMode,
          onToggle: (value) => handleToggle('darkMode', value),
          description: 'Switch between light and dark theme',
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications-outline',
      items: [
        {
          id: 'pushNotifications',
          label: 'Push Notifications',
          icon: 'notifications-outline',
          type: 'toggle',
          value: pushNotifications,
          onToggle: (value) => handleToggle('pushNotifications', value),
          description: 'Receive push notifications',
        },
        {
          id: 'emergencyAlerts',
          label: 'Emergency Alerts',
          icon: 'alert-circle-outline',
          type: 'toggle',
          value: emergencyAlerts,
          onToggle: (value) => handleToggle('emergencyAlerts', value),
          description: 'Get critical emergency alerts',
        },
        {
          id: 'locationServices',
          label: 'Location Services',
          icon: 'location-outline',
          type: 'toggle',
          value: locationServices,
          onToggle: (value) => handleToggle('locationServices', value),
          description: 'Share location for emergency',
        },
      ],
    },
    {
      id: 'preferences',
      title: 'Preferences',
      icon: 'settings-outline',
      items: [
        {
          id: 'soundEnabled',
          label: 'Sound Effects',
          icon: 'volume-high-outline',
          type: 'toggle',
          value: soundEnabled,
          onToggle: (value) => handleToggle('soundEnabled', value),
          description: 'Enable sound effects',
        },
        {
          id: 'vibrationEnabled',
          label: 'Vibration',
          icon: 'phone-portrait-outline',
          type: 'toggle',
          value: vibrationEnabled,
          onToggle: (value) => handleToggle('vibrationEnabled', value),
          description: 'Enable vibration feedback',
        },
      ],
    },
    {
      id: 'account',
      title: 'Account',
      icon: 'person-outline',
      items: [
        {
          id: 'profile',
          label: 'Edit Profile',
          icon: 'person-outline',
          type: 'navigation',
          onPress: () => navigation.navigate('EditProfile'),
        },
        {
          id: 'emergency_contacts',
          label: 'Emergency Contacts',
          icon: 'people-outline',
          type: 'navigation',
          onPress: () => navigation.navigate('EmergencyContacts'),
        },
        {
          id: 'clear_data',
          label: 'Clear App Data',
          icon: 'trash-outline',
          type: 'action',
          color: '#DC2626',
          onPress: handleClearData,
        },
        {
          id: 'logout',
          label: 'Logout',
          icon: 'log-out-outline',
          type: 'action',
          color: '#DC2626',
          onPress: handleLogout,
        },
      ],
    },
    {
      id: 'support',
      title: 'Support',
      icon: 'help-circle-outline',
      items: [
        {
          id: 'faq',
          label: 'FAQ',
          icon: 'help-circle-outline',
          type: 'action',
          onPress: handleFAQ,
          description: 'Frequently asked questions',
        },
        {
          id: 'contact_support',
          label: 'Contact Support',
          icon: 'chatbubbles-outline',
          type: 'action',
          onPress: handleContactSupport,
          description: 'Email or call us for help',
        },
        {
          id: 'report_bug',
          label: 'Report Bug',
          icon: 'bug-outline',
          type: 'action',
          onPress: handleReportBug,
          description: 'Report a bug or issue',
        },
        {
          id: 'rate_app',
          label: 'Rate App',
          icon: 'star-outline',
          type: 'action',
          onPress: handleRateApp,
          description: 'Rate us on app store',
        },
        {
          id: 'share_app',
          label: 'Share App',
          icon: 'share-outline',
          type: 'action',
          onPress: handleShareApp,
          description: 'Share with friends',
        },
        {
          id: 'privacy_policy',
          label: 'Privacy Policy',
          icon: 'shield-outline',
          type: 'action',
          onPress: handlePrivacyPolicy,
          description: 'Read our privacy policy',
        },
        {
          id: 'terms_of_service',
          label: 'Terms of Service',
          icon: 'document-text-outline',
          type: 'action',
          onPress: handleTermsOfService,
          description: 'Read terms and conditions',
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingsItem) => {
    const iconColor = item.color || colors.iconColor;
    
    switch(item.type) {
      case 'toggle':
        return (
          <View style={[styles.settingItem, { 
            backgroundColor: colors.cardBg,
            borderBottomColor: colors.cardBorder,
          }]} key={item.id}>
            <View style={styles.settingItemLeft}>
              <View style={[styles.iconWrapper, { backgroundColor: colors.iconBg }]}>
                <Ionicons name={item.icon as any} size={20} color={iconColor} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                {item.description && (
                  <Text style={[styles.settingDescription, { color: colors.textMuted }]}>{item.description}</Text>
                )}
              </View>
            </View>
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: '#E5E7EB', true: '#DC2626' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E7EB"
            />
          </View>
        );
      case 'navigation':
        return (
          <TouchableOpacity
            style={[styles.settingItem, { 
              backgroundColor: colors.cardBg,
              borderBottomColor: colors.cardBorder,
            }]}
            key={item.id}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <View style={[styles.iconWrapper, { backgroundColor: colors.iconBg }]}>
                <Ionicons name={item.icon as any} size={20} color={iconColor} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                {item.description && (
                  <Text style={[styles.settingDescription, { color: colors.textMuted }]}>{item.description}</Text>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        );
      case 'action':
        return (
          <TouchableOpacity
            style={[styles.settingItem, { 
              backgroundColor: colors.cardBg,
              borderBottomColor: colors.cardBorder,
            }]}
            key={item.id}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <View style={[styles.iconWrapper, { backgroundColor: colors.iconBg }]}>
                <Ionicons name={item.icon as any} size={20} color={iconColor} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, item.color && { color: item.color }]}>{item.label}</Text>
                {item.description && (
                  <Text style={[styles.settingDescription, { color: colors.textMuted }]}>{item.description}</Text>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.fullScreenContainer, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={isDarkMode ? '#0F0F1A' : '#DC2626'} />

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
          <TouchableOpacity
            style={[styles.profileCard, { 
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
              shadowColor: '#000',
              shadowOpacity: isDarkMode ? 0.4 : 0.08,
            }]}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <View style={styles.profileContent}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>{getUserInitials()}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.textPrimary }]}>{getUserName()}</Text>
                <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{getUserEmail()}</Text>
                <Text style={[styles.profileVersion, { color: colors.textMuted }]}>Version {getVersion()}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
            </View>
          </TouchableOpacity>

          {/* Settings Sections */}
          {settingsSections.map((section) => (
            <View key={section.id} style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons name={section.icon as any} size={20} color={colors.sectionIcon} />
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{section.title}</Text>
              </View>
              <View style={[styles.sectionCard, { 
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
              }]}>
                {section.items.map((item) => renderSettingItem(item))}
              </View>
            </View>
          ))}

          {/* App Info */}
          <View style={styles.appInfoContainer}>
            <Text style={[styles.appInfoText, { color: colors.textSecondary }]}>
              Emergency Response App v{getVersion()}
            </Text>
            <Text style={[styles.appInfoSubtext, { color: colors.textMuted }]}>
              © 2024 Emergency Response. All rights reserved.
            </Text>
            <View style={styles.appInfoLinks}>
              <TouchableOpacity onPress={handlePrivacyPolicy} activeOpacity={0.7}>
                <Text style={[styles.appInfoLink, { color: colors.linkColor }]}>Privacy Policy</Text>
              </TouchableOpacity>
              <View style={[styles.appInfoDivider, { backgroundColor: colors.cardBorder }]} />
              <TouchableOpacity onPress={handleTermsOfService} activeOpacity={0.7}>
                <Text style={[styles.appInfoLink, { color: colors.linkColor }]}>Terms of Service</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Custom Modal */}
      <Modal
        transparent
        visible={modalVisible}
        onRequestClose={closeModal}
        animationType="none"
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <Animated.View style={[styles.modalOverlay, { opacity: modalFadeAnim }]} />
        </TouchableWithoutFeedback>
        
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: modalSlideAnim }],
              backgroundColor: colors.modalBg,
              borderColor: colors.modalBorder,
            }
          ]}
        >
          <View style={styles.modalHandle} />
          
          <Text style={[styles.modalTitle, { color: colors.modalText }]}>
            {modalContent.title}
          </Text>
          
          <Text style={[styles.modalBody, { color: colors.modalSubtext }]}>
            {modalContent.body}
          </Text>
          
          <View style={styles.modalButtonContainer}>
            {modalContent.buttons ? (
              modalContent.buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalButton,
                    button.style === 'cancel' && styles.modalButtonCancel,
                    { backgroundColor: button.style === 'cancel' ? 'transparent' : colors.modalButtonBg }
                  ]}
                  onPress={button.onPress || closeModal}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.modalButtonText,
                    button.style === 'cancel' ? { color: colors.textMuted } : { color: colors.modalButtonText }
                  ]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.modalButtonBg }]}
                onPress={closeModal}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, { color: colors.modalButtonText }]}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
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
    fontSize: isSmallDevice ? 16 : 18,
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: isSmallDevice ? 50 : 60,
    height: isSmallDevice ? 50 : 60,
    borderRadius: isSmallDevice ? 25 : 30,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  profileAvatarText: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: isSmallDevice ? 15 : 18,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: isSmallDevice ? 11 : 13,
    marginTop: 2,
  },
  profileVersion: {
    fontSize: isSmallDevice ? 10 : 12,
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
    fontSize: isSmallDevice ? 12 : 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: isSmallDevice ? 10 : 12,
    paddingHorizontal: isSmallDevice ? 14 : 16,
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: isSmallDevice ? 12 : 14,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: isSmallDevice ? 10 : 11,
    marginTop: 1,
  },

  // App Info
  appInfoContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 8,
  },
  appInfoText: {
    fontSize: isSmallDevice ? 11 : 13,
  },
  appInfoSubtext: {
    fontSize: isSmallDevice ? 10 : 12,
    marginTop: 4,
  },
  appInfoLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  appInfoLink: {
    fontSize: isSmallDevice ? 11 : 13,
    fontWeight: '500',
  },
  appInfoDivider: {
    width: 1,
    height: 16,
    marginHorizontal: isSmallDevice ? 12 : 16,
  },

  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 16,
    borderWidth: 1,
    borderTopWidth: 0,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalBody: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  modalButtonCancel: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SettingsScreen;