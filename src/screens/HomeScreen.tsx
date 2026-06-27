// src/screens/HomeScreen.tsx
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
  SafeAreaView,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export const HomeScreen = ({ navigation }: any) => {
  // Operational States
  const [isLocationSharing, setIsLocationSharing] = useState(false);
  const [torchActive, setTorchActive] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);
  const [recordingActive, setRecordingActive] = useState(false);

  // Animation Nodes for Professional Micro-Interactions
  const sosScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Continuous Pulse Effect on the Core SOS Trigger (Signals Active App State)
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // SOS Tactical Trigger Functions
  const handleSOSPressIn = () => {
    Animated.timing(sosScale, { toValue: 0.94, duration: 100, useNativeDriver: true }).start();
  };

  const handleSOSRelease = () => {
    Animated.timing(sosScale, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    Vibration.vibrate([0, 200, 100, 200]);
    navigation.navigate('SOS');
  };

  const handleServiceCall = (serviceName: string) => {
    Vibration.vibrate(50);
    Alert.alert('Routing Direct Line', `Initiating cellular link to ${serviceName} dispatch protocols...`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 1. TOP ACTION BAR / HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconButton}>
          <Text style={styles.headerIcon}>☰</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerEmergencyEmoji}>🚨</Text>
          <Text style={styles.headerTitleText}>Emergency Response</Text>
        </View>
        <View style={styles.headerRightGroup}>
          <TouchableOpacity style={styles.headerIconButton}>
            <Text style={styles.headerIcon}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton} onPress={() => Alert.alert('Navigation', 'Routing to Settings Matrix...')}>
            <Text style={styles.headerIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 2. WELCOME / PROFILE CARD */}
        <LinearGradient colors={['#1E293B', '#0F172A']} start={{x:0, y:0}} end={{x:1, y:1}} style={styles.welcomeCard}>
          <View style={styles.welcomeLeft}>
            <Text style={styles.welcomeGreeting}>Welcome Back 👋</Text>
            <Text style={styles.welcomeName}>Kinza Ali</Text>
            <View style={styles.roleBadge}>
              <View style={styles.roleDot} />
              <Text style={styles.roleText}>Role: Citizen User</Text>
            </View>
          </View>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' }} 
            style={styles.profileImage} 
          />
        </LinearGradient>

        {/* 3. METRIC DASHBOARD GRID */}
        <View style={styles.metricGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>12</Text>
            <Text style={styles.metricLabel}>SOS Sent</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>5</Text>
            <Text style={styles.metricLabel}>Contacts</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>8</Text>
            <Text style={styles.metricLabel}>Reports</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>30</Text>
            <Text style={styles.metricLabel}>Safe Days</Text>
          </View>
        </View>

        {/* 4. MAIN CENTRAL SOS TRIGGER */}
        <Animated.View style={[styles.sosContainer, { transform: [{ scale: Animated.multiply(sosScale, pulseAnim) }] }]}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={handleSOSPressIn}
            onPress={handleSOSRelease}
            style={styles.sosButton}
          >
            <LinearGradient colors={['#DC2626', '#7F1D1D']} style={styles.sosGradient}>
              <Text style={styles.sosEmoji}>🚨</Text>
              <Text style={styles.sosText}>EMERGENCY SOS</Text>
              <Text style={styles.sosSubtext}>Need immediate assistance?</Text>
              <View style={styles.sosActionBadge}>
                <Text style={styles.sosActionText}>TAP TO DISPATCH</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* 5. COGNITIVE EMERGENCY SERVICES GRID */}
        <Text style={styles.sectionTitle}>Emergency Services Dispatch</Text>
        <View style={styles.servicesGrid}>
          {[
            { label: 'Ambulance', emoji: '🚑', color: '#EF4444' },
            { label: 'Police Force', emoji: '👮', color: '#3B82F6' },
            { label: 'Fire Brigade', emoji: '🚒', color: '#F97316' },
            { label: 'Rescue 1122', emoji: '🆘', color: '#10B981' },
            { label: 'Hospitals', emoji: '🏥', color: '#EC4899' },
            { label: 'Disaster Team', emoji: '⚠️', color: '#F59E0B' },
          ].map((service, index) => (
            <TouchableOpacity key={index} style={styles.serviceCard} onPress={() => handleServiceCall(service.label)}>
              <Text style={styles.serviceEmoji}>{service.emoji}</Text>
              <Text style={styles.serviceLabel}>{service.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 6. REAL-TIME SAFETY UTILITIES PANEL */}
        <Text style={styles.sectionTitle}>Tactical Telemetry & Safety Actions</Text>
        
        {/* Live Location Module */}
        <View style={styles.utilityRowCard}>
          <View style={styles.utilityLeft}>
            <Text style={styles.utilityIcon}>📍</Text>
            <View>
              <Text style={styles.utilityTitle}>Live Location Tracking</Text>
              <Text style={styles.utilitySub}>{isLocationSharing ? 'Broadcasting live coordinates' : 'Encrypted fallback active'}</Text>
            </View>
          </View>
          <Switch
            value={isLocationSharing}
            onValueChange={(val) => {
              setIsLocationSharing(val);
              Vibration.vibrate(60);
            }}
            trackColor={{ false: '#334155', true: '#10B981' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Safety Check-In Module */}
        <TouchableOpacity style={styles.safetyCheckCard} onPress={() => Alert.alert('Status Sync Complete', 'Your emergency circles have been pinged that you are SAFE.')}>
          <Text style={styles.safetyCheckEmoji}>✅</Text>
          <View>
            <Text style={styles.safetyCheckTitle}>I Am Safe & Secure</Text>
            <Text style={styles.safetyCheckSub}>Rapidly notify family networks after incident resolution</Text>
          </View>
        </TouchableOpacity>

        {/* 7. QUICK INTERACTION HARDWARE PERIPHERALS */}
        <View style={styles.hardwareGrid}>
          <TouchableOpacity 
            style={[styles.hardwareCard, recordingActive && styles.hardwareCardActive]} 
            onPress={() => setRecordingActive(!recordingActive)}
          >
            <Text style={styles.hardwareEmoji}>{recordingActive ? '🛑' : '🎤'}</Text>
            <Text style={styles.hardwareLabel}>{recordingActive ? 'Recording Ambient' : 'Panic Audio Rec'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.hardwareCard, torchActive && styles.hardwareCardActive]} 
            onPress={() => setTorchActive(!torchActive)}
          >
            <Text style={styles.hardwareEmoji}>🔦</Text>
            <Text style={styles.hardwareLabel}>{torchActive ? 'Torch Active' : 'Emergency Torch'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.hardwareCard, sirenActive && styles.hardwareCardActive]} 
            onPress={() => setSirenActive(!sirenActive)}
          >
            <Text style={styles.hardwareEmoji}>📢</Text>
            <Text style={styles.hardwareLabel}>{sirenActive ? 'Siren Pulsing' : 'Siren Alarm Mode'}</Text>
          </TouchableOpacity>
        </View>

        {/* 8. OFFLINE MEDICAL IDENTITY SHEET (ICE) */}
        <Text style={styles.sectionTitle}>Medical Information Profile (ICE)</Text>
        <View style={styles.medicalCard}>
          <View style={styles.medicalHeader}>
            <Text style={styles.medicalTitle}>🔴 CRITICAL RESPONDER CARD</Text>
            <Text style={styles.medicalBadge}>Offline Cached</Text>
          </View>
          <View style={styles.medicalDivider} />
          <View style={styles.medicalGridData}>
            <Text style={styles.medicalLine}>🩸 <Text style={styles.boldText}>Blood Group:</Text> O-Positive (O+)</Text>
            <Text style={styles.medicalLine}>⚠️ <Text style={styles.boldText}>Allergies:</Text> Penicillin Compound Constraints</Text>
            <Text style={styles.medicalLine}>💊 <Text style={styles.boldText}>Conditions:</Text> Asthma history (Inhaler equipped)</Text>
            <Text style={styles.medicalLine}>📋 <Text style={styles.boldText}>Notes:</Text> ICE Contact: Father (+92-555-0192)</Text>
          </View>
        </View>

        {/* 9. CRITICAL INCIDENT LOG & DISASTER ALERTS */}
        <Text style={styles.sectionTitle}>Localized Danger Feed</Text>
        <View style={styles.alertFeed}>
          <View style={[styles.feedItem, { borderLeftColor: '#EF4444' }]}>
            <View style={styles.feedHeaderRow}>
              <Text style={[styles.feedBadge, { backgroundColor: '#7F1D1D', color: '#F87171' }]}>CRITICAL ALERT</Text>
              <Text style={styles.feedTime}>3m ago</Text>
            </View>
            <Text style={styles.feedTitle}>🌧️ Flash Flood Warning</Text>
            <Text style={styles.feedDesc}>Heavy rainfall triggers rising water levels in sector grids.</Text>
          </View>

          <View style={[styles.feedItem, { borderLeftColor: '#F59E0B' }]}>
            <View style={styles.feedHeaderRow}>
              <Text style={[styles.feedBadge, { backgroundColor: '#78350F', color: '#FBBF24' }]}>WEATHER WARNING</Text>
              <Text style={styles.feedTime}>45m ago</Text>
            </View>
            <Text style={styles.feedTitle}>🌍 Seismic Activity Advisory</Text>
            <Text style={styles.feedDesc}>Minor tremors recorded across fault zones. Maintain caution.</Text>
          </View>
        </View>

        {/* 10. DAILY STRATEGIC SAFETY GUIDELINES */}
        <Text style={styles.sectionTitle}>Proactive Safety Protocols</Text>
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Strategic Safety Tip of the Day</Text>
          <Text style={styles.tipDesc}>
            Ensure your physical on-device offline profile cache is synchronized weekly. First responders access your ICE card directly from locked lock-screens during consciousness loss.
          </Text>
        </View>

      </ScrollView>

      {/* 11. BOTTOM NAVIGATION FOOTER INTERFACE */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItemActive}>
          <Text style={styles.navIconActive}>🏠</Text>
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('RequestHistory')}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090D16' }, // Dark obsidian background provides higher tactical contrast
  
  // 1. App Header Style
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderColor: '#1E293B',
    backgroundColor: '#090D16'
  },
  headerIconButton: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  headerIcon: { color: '#E2E8F0', fontSize: 16, fontWeight: 'bold' },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  headerEmergencyEmoji: { fontSize: 18, marginRight: 6 },
  headerTitleText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  headerRightGroup: { flexDirection: 'row', gap: 8 },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },

  // 2. Personalization Profile System
  welcomeCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 16, padding: 18, marginTop: 16, borderWidth: 1, borderColor: '#334155' },
  welcomeLeft: { flex: 1 },
  welcomeGreeting: { color: '#94A3B8', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  welcomeName: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 2 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  roleDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3B82F6', marginRight: 6 },
  roleText: { color: '#93C5FD', fontSize: 11, fontWeight: '700' },
  profileImage: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#3B82F6' },

  // 3. Analytics Dashboard Metric Grid Layout
  metricGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 8 },
  metricCard: { width: (width - 40) / 4, backgroundColor: '#1E293B', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  metricValue: { color: '#38BDF8', fontSize: 18, fontWeight: '800' },
  metricLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '600', marginTop: 2 },

  // 4. Central SOS Target Trigger Layout
  sosContainer: { marginTop: 20, width: '100%', alignItems: 'center' },
  sosButton: { width: '100%', borderRadius: 24, overflow: 'hidden', elevation: 8, shadowColor: '#DC2626', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
  sosGradient: { paddingVertical: 26, paddingHorizontal: 20, alignItems: 'center' },
  sosEmoji: { fontSize: 32, marginBottom: 4 },
  sosText: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', letterSpacing: 1.5 },
  sosSubtext: { color: '#FCA5A5', fontSize: 12, marginTop: 2, fontWeight: '500' },
  sosActionBadge: { marginTop: 14, backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  sosActionText: { color: '#7F1D1D', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  sectionTitle: { color: '#94A3B8', fontSize: 13, fontWeight: '800', uppercase: true, letterSpacing: 1, marginTop: 24, marginBottom: 12, paddingLeft: 2 },

  // 5. Emergency Services Grid Array
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  serviceCard: { width: (width - 40) / 2, backgroundColor: '#1E293B', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  serviceEmoji: { fontSize: 20, marginRight: 10 },
  serviceLabel: { color: '#E2E8F0', fontSize: 13, fontWeight: '700' },

  // 6. Technical Telemetry & Location Utilities Panel
  utilityRowCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#334155' },
  utilityLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  utilityIcon: { fontSize: 22 },
  utilityTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  utilitySub: { color: '#94A3B8', fontSize: 11, marginTop: 1 },
  safetyCheckCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#064E3B', borderRadius: 14, padding: 14, marginTop: 8, borderWidth: 1, borderColor: '#059669' },
  safetyCheckEmoji: { fontSize: 22 },
  safetyCheckTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  safetyCheckSub: { color: '#A7F3D0', fontSize: 11, marginTop: 1 },

  // 7. Ambient Audio, Siren, and Light Peripherals Grid
  hardwareGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 8 },
  hardwareCard: { flex: 1, backgroundColor: '#1E293B', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  hardwareCardActive: { backgroundColor: '#7F1D1D', borderColor: '#EF4444' },
  hardwareEmoji: { fontSize: 18, marginBottom: 4 },
  hardwareLabel: { color: '#E2E8F0', fontSize: 10, fontWeight: '700', textAlign: 'center' },

  // 8. Offline Identity & Medical ICE Card
  medicalCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#7F1D1D' },
  medicalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  medicalTitle: { color: '#EF4444', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  medicalBadge: { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5', fontSize: 10, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  medicalDivider: { height: 1, backgroundColor: '#334155', marginVertical: 12 },
  medicalGridData: { gap: 6 },
  medicalLine: { color: '#CBD5E1', fontSize: 12 },
  boldText: { fontWeight: '700', color: '#FFFFFF' },

  // 9. Incident Log Danger Feed Nodes
  alertFeed: { gap: 8 },
  feedItem: { backgroundColor: '#1E293B', borderRadius: 14, padding: 14, borderLeftWidth: 4, borderWidth: 1, borderTopColor: '#334155', borderRightColor: '#334155', borderBottomColor: '#334155' },
  feedHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  feedBadge: { fontSize: 9, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  feedTime: { color: '#64748B', fontSize: 10, fontWeight: '500' },
  feedTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  feedDesc: { color: '#94A3B8', fontSize: 12, marginTop: 2, lineHeight: 16 },

  // 10. Proactive Safety Guidelines Card
  tipCard: { backgroundColor: '#1E293B', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#334155', borderStyle: 'dashed' },
  tipTitle: { color: '#F59E0B', fontSize: 13, fontWeight: '800' },
  tipDesc: { color: '#94A3B8', fontSize: 12, marginTop: 6, lineHeight: 18 },

  // 11. Tactical Bottom Navigation Footer
  bottomNav: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    height: 64, 
    backgroundColor: '#0F172A', 
    flexDirection: 'row', 
    borderTopWidth: 1, 
    borderColor: '#1E293B', 
    paddingBottom: 4 
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navItemActive: { flex: 1, alignItems: 'center', justifyContent: 'center', borderTopWidth: 2, borderTopColor: '#EF4444' },
  navIcon: { fontSize: 18, color: '#64748B' },
  navIconActive: { fontSize: 18, color: '#EF4444' },
  navText: { color: '#64748B', fontSize: 10, fontWeight: '600', marginTop: 2 },
  navTextActive: { color: '#EF4444', fontSize: 10, fontWeight: '700', marginTop: 2 },
});