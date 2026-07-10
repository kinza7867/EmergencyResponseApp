// src/screens/ProfileScreen.tsx
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
  Share,
  Linking,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const LOGO = require('../../assets/logo.png');
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 380;

interface UserData {
  name: string;
  email: string;
  phone: string;
  address?: string;
  bloodGroup?: string;
  allergies?: string;
  medicalConditions?: string;
  medications?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  emergencyRelationship?: string;
  photo?: string;
}

export const ProfileScreen = ({ navigation }: any) => {
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadUserData();
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();

    // Reload data when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      // Try to get from userProfile first (complete profile)
      const profileString = await AsyncStorage.getItem('userProfile');
      if (profileString) {
        const profile = JSON.parse(profileString);
        setUserData(profile);
      } else {
        // Fallback to userData
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          setUserData(JSON.parse(userDataString));
        }
      }
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
        onPress: () => signOut(),
      },
    ]);
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Emergency Response App — Get help instantly! Download now and stay safe.',
        title: 'Emergency Response App',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleEmergencyCall = () => {
    Alert.alert('Emergency Call', 'Select emergency service to call:', [
      { text: 'Ambulance (1122)', onPress: () => Linking.openURL('tel:1122') },
      { text: 'Police (15)', onPress: () => Linking.openURL('tel:15') },
      { text: 'Fire Brigade (16)', onPress: () => Linking.openURL('tel:16') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const navigateToEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const navigateToEmergencyContacts = () => {
    navigation.navigate('EmergencyContacts');
  };

  const navigateToHistory = () => {
    navigation.navigate('RequestHistory');
  };

  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  const navigateToNotifications = () => {
    navigation.navigate('Notifications');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const palette = ['#DC2626', '#7C3AED', '#2563EB', '#059669', '#D97706', '#4F46E5', '#0891B2', '#9333EA'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return palette[Math.abs(hash) % palette.length];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  const avatarColor = getAvatarColor(userData?.name || 'User');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
      
      {/* Full Width Red Header with Logo */}
      <LinearGradient
        colors={['#DC2626', '#991B1B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fullHeader, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image source={LOGO} style={styles.headerLogo} resizeMode="contain" />
            <Text style={styles.headerTitle}>Profile</Text>
          </View>

          <TouchableOpacity onPress={navigateToEditProfile} style={styles.editButton} activeOpacity={0.7}>
            <Ionicons name="create-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={[styles.avatarContainer, { backgroundColor: avatarColor }]}>
              {userData?.photo ? (
                <Image source={{ uri: userData.photo }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{getInitials(userData?.name || 'User')}</Text>
              )}
            </View>
            <Text style={styles.userName}>{userData?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{userData?.email || 'No email'}</Text>

            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Ionicons name="checkmark-circle" size={14} color="#065F46" />
                <Text style={styles.badgeText}>Verified</Text>
              </View>
              <View style={[styles.badge, styles.badgeActive]}>
                <Ionicons name="radio-button-on" size={14} color="#DC2626" />
                <Text style={[styles.badgeText, styles.badgeTextActive]}>Active</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <Ionicons name="call-outline" size={18} color="#6B7280" style={styles.infoIcon} />
                <Text style={styles.infoLabel}>Phone Number</Text>
              </View>
              <Text style={styles.infoValue}>{userData?.phone || 'Not set'}</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <Ionicons name="mail-outline" size={18} color="#6B7280" style={styles.infoIcon} />
                <Text style={styles.infoLabel}>Email</Text>
              </View>
              <Text style={styles.infoValue}>{userData?.email || 'Not set'}</Text>
            </View>

            {userData?.address && (
              <View style={styles.infoItem}>
                <View style={styles.infoLeft}>
                  <Ionicons name="location-outline" size={18} color="#6B7280" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>Address</Text>
                </View>
                <Text style={styles.infoValue}>{userData.address}</Text>
              </View>
            )}

            {userData?.bloodGroup && (
              <View style={styles.infoItem}>
                <View style={styles.infoLeft}>
                  <Ionicons name="heart-outline" size={18} color="#6B7280" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>Blood Group</Text>
                </View>
                <Text style={styles.infoValue}>{userData.bloodGroup}</Text>
              </View>
            )}

            {userData?.allergies && (
              <View style={styles.infoItem}>
                <View style={styles.infoLeft}>
                  <Ionicons name="alert-circle-outline" size={18} color="#6B7280" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>Allergies</Text>
                </View>
                <Text style={styles.infoValue}>{userData.allergies}</Text>
              </View>
            )}

            {userData?.medicalConditions && (
              <View style={styles.infoItem}>
                <View style={styles.infoLeft}>
                  <Ionicons name="medical-outline" size={18} color="#6B7280" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>Medical Conditions</Text>
                </View>
                <Text style={styles.infoValue}>{userData.medicalConditions}</Text>
              </View>
            )}

            {userData?.medications && (
              <View style={styles.infoItem}>
                <View style={styles.infoLeft}>
                  <Ionicons name="medkit-outline" size={18} color="#6B7280" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>Medications</Text>
                </View>
                <Text style={styles.infoValue}>{userData.medications}</Text>
              </View>
            )}

            {userData?.emergencyContact && (
              <View style={[styles.infoItem, styles.emergencyInfo]}>
                <View style={styles.infoLeft}>
                  <Ionicons name="warning-outline" size={18} color="#DC2626" style={styles.infoIcon} />
                  <Text style={[styles.infoLabel, styles.emergencyLabel]}>Emergency Contact</Text>
                </View>
                <View>
                  <Text style={[styles.infoValue, styles.emergencyValue]}>{userData.emergencyContact}</Text>
                  {userData.emergencyPhone && (
                    <Text style={styles.emergencyPhone}>{userData.emergencyPhone}</Text>
                  )}
                  {userData.emergencyRelationship && (
                    <Text style={styles.emergencyRelationship}>{userData.emergencyRelationship}</Text>
                  )}
                </View>
              </View>
            )}

            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <Ionicons name="calendar-outline" size={18} color="#6B7280" style={styles.infoIcon} />
                <Text style={styles.infoLabel}>Member Since</Text>
              </View>
              <Text style={styles.infoValue}>Today</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionItem} onPress={handleEmergencyCall} activeOpacity={0.7}>
              <Ionicons name="call" size={28} color="#DC2626" />
              <Text style={styles.quickActionLabel}>Emergency Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionItem} onPress={navigateToEmergencyContacts} activeOpacity={0.7}>
              <Ionicons name="people" size={28} color="#3B82F6" />
              <Text style={styles.quickActionLabel}>Emergency Contacts</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionItem} onPress={navigateToHistory} activeOpacity={0.7}>
              <Ionicons name="time" size={28} color="#F59E0B" />
              <Text style={styles.quickActionLabel}>Request History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionItem} onPress={handleShareApp} activeOpacity={0.7}>
              <Ionicons name="share" size={28} color="#8B5CF6" />
              <Text style={styles.quickActionLabel}>Share App</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>Quick Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statCircle, { backgroundColor: '#FEF2F2' }]}>
                  <Text style={[styles.statNumber, { color: '#DC2626' }]}>0</Text>
                </View>
                <Text style={styles.statLabel}>Total Alerts</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statCircle, { backgroundColor: '#F0FDF4' }]}>
                  <Text style={[styles.statNumber, { color: '#22C55E' }]}>0</Text>
                </View>
                <Text style={styles.statLabel}>Resolved</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statCircle, { backgroundColor: '#FFFBEB' }]}>
                  <Text style={[styles.statNumber, { color: '#F59E0B' }]}>0</Text>
                </View>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
          </View>

          {/* Quick Navigation */}
          <View style={styles.navSection}>
            <TouchableOpacity style={styles.navItem} onPress={navigateToEditProfile} activeOpacity={0.7}>
              <View style={styles.navLeft}>
                <Ionicons name="person-outline" size={22} color="#DC2626" style={styles.navIcon} />
                <Text style={styles.navLabel}>Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={navigateToSettings} activeOpacity={0.7}>
              <View style={styles.navLeft}>
                <Ionicons name="settings-outline" size={22} color="#3B82F6" style={styles.navIcon} />
                <Text style={styles.navLabel}>Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={navigateToNotifications} activeOpacity={0.7}>
              <View style={styles.navLeft}>
                <Ionicons name="notifications-outline" size={22} color="#F59E0B" style={styles.navIcon} />
                <Text style={styles.navLabel}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          </View>

          <Text style={styles.versionText}>Emergency Response App · Version 1.0.0</Text>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <LinearGradient
              colors={['#DC2626', '#991B1B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoutGradient}
            >
              <Ionicons name="log-out" size={20} color="#FFFFFF" style={styles.logoutIcon} />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5' 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F5F5F5' 
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 14, 
    color: '#6B7280' 
  },

  // Full Width Red Header with Logo
  fullHeader: {
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: '#FFFFFF' 
  },
  editButton: { 
    padding: 4 
  },

  scrollContent: { 
    padding: 16, 
    paddingBottom: 32 
  },

  // Profile Card
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  avatarContainer: {
    width: isSmallDevice ? 80 : 100,
    height: isSmallDevice ? 80 : 100,
    borderRadius: isSmallDevice ? 40 : 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: { 
    fontSize: isSmallDevice ? 30 : 36, 
    fontWeight: '700', 
    color: '#FFFFFF' 
  },
  userName: { 
    fontSize: isSmallDevice ? 18 : 22, 
    fontWeight: '700', 
    color: '#1F2937', 
    marginBottom: 2 
  },
  userEmail: { 
    fontSize: isSmallDevice ? 12 : 14, 
    color: '#6B7280', 
    marginBottom: 12 
  },
  badgeContainer: { 
    flexDirection: 'row', 
    marginBottom: 8 
  },
  badge: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4', 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 20, 
    marginHorizontal: 4,
    gap: 4,
  },
  badgeActive: { 
    backgroundColor: '#FEF2F2' 
  },
  badgeText: { 
    fontSize: 11, 
    fontWeight: '500', 
    color: '#065F46' 
  },
  badgeTextActive: {
    color: '#DC2626'
  },
  divider: { 
    width: '100%', 
    height: 1, 
    backgroundColor: '#F3F4F6', 
    marginVertical: 12 
  },
  infoItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    width: '100%', 
    paddingVertical: 6 
  },
  infoLeft: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  infoIcon: { 
    marginRight: 10 
  },
  infoLabel: { 
    fontSize: isSmallDevice ? 12 : 14, 
    color: '#6B7280' 
  },
  infoValue: { 
    fontSize: isSmallDevice ? 12 : 14, 
    color: '#1F2937', 
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  emergencyInfo: {
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  emergencyLabel: {
    color: '#DC2626',
    fontWeight: '600',
  },
  emergencyValue: {
    color: '#DC2626',
    fontWeight: '700',
  },
  emergencyPhone: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#DC2626',
    fontWeight: '500',
    textAlign: 'right',
  },
  emergencyRelationship: {
    fontSize: isSmallDevice ? 10 : 11,
    color: '#6B7280',
    textAlign: 'right',
  },

  // Quick Actions
  quickActions: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    justifyContent: 'space-between', 
    marginBottom: 16,
    gap: 8,
  },
  quickActionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    minWidth: (width - 56) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  quickActionLabel: { 
    fontSize: isSmallDevice ? 9 : 10, 
    color: '#1F2937', 
    fontWeight: '500', 
    textAlign: 'center',
    marginTop: 4,
  },

  // Stats
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
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statsTitle: { 
    fontSize: isSmallDevice ? 14 : 16, 
    fontWeight: '600', 
    color: '#1F2937', 
    marginBottom: 12 
  },
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around' 
  },
  statItem: { 
    alignItems: 'center' 
  },
  statCircle: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 6 
  },
  statNumber: { 
    fontSize: 20, 
    fontWeight: '700' 
  },
  statLabel: { 
    fontSize: isSmallDevice ? 10 : 11, 
    color: '#6B7280' 
  },

  // Navigation Section
  navSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  navItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navIcon: {
    marginRight: 12,
  },
  navLabel: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#1F2937',
    fontWeight: '500',
  },

  versionText: { 
    textAlign: 'center', 
    fontSize: 11, 
    color: '#9CA3AF', 
    marginBottom: 12 
  },

  // Logout
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutGradient: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: { 
    color: '#FFFFFF', 
    fontSize: isSmallDevice ? 14 : 16, 
    fontWeight: '600' 
  },
});

export default ProfileScreen;