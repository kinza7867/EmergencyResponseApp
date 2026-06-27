// src/screens/ProfileScreen.tsx
// Changes from original:
//   • navigation.replace('Login') → signOut() from AuthContext
//   • Added useSafeAreaInsets to fix header cut off by status bar on all devices
//   • Removed unused Dimensions (width/height) import

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
  Switch,
  Share,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

interface UserData {
  name: string;
  email: string;
  phone: string;
}

export const ProfileScreen = ({ navigation }: any) => {
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadUserData();
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) setUserData(JSON.parse(userDataString));
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => signOut(), // clears token → AppNavigator shows Login
      },
    ]);
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: '🚨 Emergency Response App — Get help instantly! Download now and stay safe.',
        title: 'Emergency Response App',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleEmergencyCall = () => {
    Alert.alert('📞 Emergency Call', 'Select emergency service to call:', [
      { text: '🚑 Ambulance (1122)', onPress: () => Linking.openURL('tel:1122') },
      { text: '👮 Police (15)', onPress: () => Linking.openURL('tel:15') },
      { text: '🔥 Fire Brigade (16)', onPress: () => Linking.openURL('tel:16') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleEditProfile = () =>
    Alert.alert('✏️ Edit Profile', 'This feature will be available in the next update.', [{ text: 'OK' }]);

  const handleChangePassword = () =>
    Alert.alert('🔒 Change Password', 'This feature will be available in the next update.', [{ text: 'OK' }]);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const palette = ['#2563EB', '#7C3AED', '#DC2626', '#059669', '#D97706', '#4F46E5', '#0891B2', '#9333EA'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return palette[Math.abs(hash) % palette.length];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  const avatarColor = getAvatarColor(userData?.name || 'User');

  return (
    <View style={styles.container}>
      {/* Header — paddingTop = safe area inset so it's never under the status bar */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
          <Text style={styles.editText}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={[styles.avatarContainer, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{getInitials(userData?.name || 'User')}</Text>
            </View>
            <Text style={styles.userName}>{userData?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{userData?.email || 'No email'}</Text>

            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✅ Verified</Text>
              </View>
              <View style={[styles.badge, styles.badgeActive]}>
                <Text style={styles.badgeText}>🟢 Active</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <Text style={styles.infoIcon}>📱</Text>
                <Text style={styles.infoLabel}>Phone Number</Text>
              </View>
              <Text style={styles.infoValue}>{userData?.phone || 'Not set'}</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <Text style={styles.infoIcon}>📧</Text>
                <Text style={styles.infoLabel}>Email</Text>
              </View>
              <Text style={styles.infoValue}>{userData?.email || 'Not set'}</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <Text style={styles.infoIcon}>🕐</Text>
                <Text style={styles.infoLabel}>Member Since</Text>
              </View>
              <Text style={styles.infoValue}>Today</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionItem} onPress={handleEmergencyCall}>
              <Text style={styles.quickActionEmoji}>📞</Text>
              <Text style={styles.quickActionLabel}>Emergency Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem} onPress={handleShareApp}>
              <Text style={styles.quickActionEmoji}>📤</Text>
              <Text style={styles.quickActionLabel}>Share App</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem} onPress={handleChangePassword}>
              <Text style={styles.quickActionEmoji}>🔒</Text>
              <Text style={styles.quickActionLabel}>Change Password</Text>
            </TouchableOpacity>
          </View>

          {/* Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsTitle}>⚙️ Settings</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🔔</Text>
                <View>
                  <Text style={styles.settingLabel}>Notifications</Text>
                  <Text style={styles.settingSubtext}>Receive SOS alerts</Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🌙</Text>
                <View>
                  <Text style={styles.settingLabel}>Dark Mode</Text>
                  <Text style={styles.settingSubtext}>Coming soon</Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
                thumbColor="#FFFFFF"
                disabled
              />
            </View>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>❓</Text>
                <View>
                  <Text style={styles.settingLabel}>Help & Support</Text>
                  <Text style={styles.settingSubtext}>FAQ, contact us</Text>
                </View>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>📄</Text>
                <View>
                  <Text style={styles.settingLabel}>Privacy Policy</Text>
                  <Text style={styles.settingSubtext}>Read our privacy policy</Text>
                </View>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>📊 Quick Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statCircle, { backgroundColor: '#DBEAFE' }]}>
                  <Text style={styles.statNumber}>0</Text>
                </View>
                <Text style={styles.statLabel}>Total Alerts</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statCircle, { backgroundColor: '#D1FAE5' }]}>
                  <Text style={[styles.statNumber, { color: '#059669' }]}>0</Text>
                </View>
                <Text style={styles.statLabel}>Resolved</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statCircle, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.statNumber, { color: '#D97706' }]}>0</Text>
                </View>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
          </View>

          <Text style={styles.versionText}>Emergency Response App · Version 1.0.0</Text>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>🚪 Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: { padding: 4 },
  backText: { fontSize: 14, color: '#2563EB', fontWeight: '500' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  editButton: { padding: 4 },
  editText: { fontSize: 18 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: '#FFFFFF' },
  userName: { fontSize: 22, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  userEmail: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  badgeContainer: { flexDirection: 'row', marginBottom: 8 },
  badge: { backgroundColor: '#D1FAE5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginHorizontal: 4 },
  badgeActive: { backgroundColor: '#DBEAFE' },
  badgeText: { fontSize: 11, fontWeight: '500', color: '#065F46' },
  divider: { width: '100%', height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  infoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingVertical: 8 },
  infoLeft: { flexDirection: 'row', alignItems: 'center' },
  infoIcon: { fontSize: 16, marginRight: 10 },
  infoLabel: { fontSize: 14, color: '#6B7280' },
  infoValue: { fontSize: 14, color: '#1F2937', fontWeight: '500' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  quickActionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionEmoji: { fontSize: 24, marginBottom: 4 },
  quickActionLabel: { fontSize: 10, color: '#1F2937', fontWeight: '500', textAlign: 'center' },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingIcon: { fontSize: 20, marginRight: 12 },
  settingLabel: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  settingSubtext: { fontSize: 11, color: '#9CA3AF' },
  settingArrow: { fontSize: 18, color: '#D1D5DB' },
  statsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  statNumber: { fontSize: 20, fontWeight: '700', color: '#2563EB' },
  statLabel: { fontSize: 11, color: '#6B7280' },
  versionText: { textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginBottom: 12 },
  logoutButton: {
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});