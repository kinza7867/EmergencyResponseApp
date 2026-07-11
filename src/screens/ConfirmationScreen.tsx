// src/screens/ConfirmationScreen.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  StatusBar,
  Platform,
  Share,
  Linking,
  Alert,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { EmergencyRequest } from '../services/emergencyService';

const TYPE_META: Record<string, { icon: string; iconSet: 'ionicons' | 'fontawesome5'; color: string; bgColor: string }> = {
  medical:  { icon: 'medical', iconSet: 'ionicons', color: '#DC2626', bgColor: '#FEF2F2' },
  fire:     { icon: 'flame', iconSet: 'ionicons', color: '#F97316', bgColor: '#FFF7ED' },
  police:   { icon: 'shield', iconSet: 'ionicons', color: '#3B82F6', bgColor: '#EFF6FF' },
  accident: { icon: 'car', iconSet: 'ionicons', color: '#8B5CF6', bgColor: '#F5F3FF' },
  rescue:   { icon: 'life-ring', iconSet: 'fontawesome5', color: '#EC4899', bgColor: '#FDF2F8' },
  other:    { icon: 'alert-circle', iconSet: 'ionicons', color: '#6B7280', bgColor: '#F3F4F6' },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const ConfirmationScreen = ({ route, navigation }: any) => {
  const request: EmergencyRequest = route.params?.request;

  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
    Vibration.vibrate([0, 100, 50, 100]);
  }, []);

  if (!request) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#DC2626" />
          <Text style={styles.errorText}>No request data found.</Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.errorButtonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const meta = TYPE_META[request.emergencyType] || TYPE_META.other;

  const renderTypeIcon = () => {
    const size = 28;
    const color = meta.color;
    if (meta.iconSet === 'fontawesome5') {
      return <FontAwesome5 name={meta.icon as any} size={size} color={color} />;
    }
    return <Ionicons name={meta.icon as any} size={size} color={color} />;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🚨 Emergency Alert\n\nID: ${request.id}\nType: ${request.emergencyType.toUpperCase()}\nLocation: ${request.location.label}\nStatus: Pending\n\nSent via Emergency Response App`,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share.');
    }
  };

  const handleCallEmergency = () => {
    Alert.alert(
      'Emergency Call',
      'Select emergency service:',
      [
        { text: 'Ambulance (1122)', onPress: () => Linking.openURL('tel:1122') },
        { text: 'Police (15)', onPress: () => Linking.openURL('tel:15') },
        { text: 'Fire (16)', onPress: () => Linking.openURL('tel:16') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <Animated.View style={[styles.successIconWrap, { transform: [{ scale: scaleAnim }], opacity: fadeAnim }]}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark-circle" size={56} color="#22C55E" />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
          <Text style={styles.title}>Alert Dispatched!</Text>
          <Text style={styles.subtitle}>
            Your emergency request has been submitted. Help is on the way.
          </Text>

          {/* Quick Actions */}
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={[styles.quickAction, styles.quickActionShare]} onPress={handleShare}>
              <Ionicons name="share" size={22} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickAction, styles.quickActionCall]} onPress={handleCallEmergency}>
              <Ionicons name="call" size={22} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Call</Text>
            </TouchableOpacity>
          </View>

          {/* Request ID Card */}
          <View style={styles.idCard}>
            <Text style={styles.idLabel}>Request ID</Text>
            <Text style={styles.idValue}>{request.id.toUpperCase()}</Text>
            <View style={styles.idBadge}>
              <View style={styles.idDot} />
              <Text style={styles.idBadgeText}>Pending Dispatch</Text>
            </View>
          </View>

          {/* Details Card */}
          <View style={styles.detailsCard}>
            <View style={[styles.typeRow, { backgroundColor: meta.bgColor }]}>
              <View style={[styles.typeIconContainer, { backgroundColor: meta.color + '20' }]}>
                {renderTypeIcon()}
              </View>
              <Text style={[styles.typeText, { color: meta.color }]}>
                {request.emergencyType.toUpperCase()} Emergency
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="location" size={18} color="#6B7280" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{request.location.label}</Text>
                <Text style={styles.detailSub}>
                  {request.location.latitude.toFixed(4)}, {request.location.longitude.toFixed(4)}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="time" size={18} color="#6B7280" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Submitted At</Text>
                <Text style={styles.detailValue}>{formatDate(request.createdAt)}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="alert-circle" size={18} color="#6B7280" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Pending — Awaiting dispatch</Text>
                </View>
              </View>
            </View>

            {request.notes ? (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="document-text" size={18} color="#6B7280" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Your Notes</Text>
                  <Text style={styles.detailValue}>{request.notes}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.infoBannerText}>
              You will be notified when your request status changes. Keep your phone nearby.
            </Text>
          </View>

          {/* What to Do Next */}
          <View style={styles.whatsNextCard}>
            <Text style={styles.whatsNextTitle}>What to Do Next</Text>
            <View style={styles.whatsNextItem}>
              <View style={styles.whatsNextNumber}>
                <Text style={styles.whatsNextNumberText}>1</Text>
              </View>
              <Text style={styles.whatsNextText}>Stay calm and stay in a safe location</Text>
            </View>
            <View style={styles.whatsNextItem}>
              <View style={styles.whatsNextNumber}>
                <Text style={styles.whatsNextNumberText}>2</Text>
              </View>
              <Text style={styles.whatsNextText}>Keep your phone charged and nearby</Text>
            </View>
            <View style={styles.whatsNextItem}>
              <View style={styles.whatsNextNumber}>
                <Text style={styles.whatsNextNumberText}>3</Text>
              </View>
              <Text style={styles.whatsNextText}>Follow instructions from responders</Text>
            </View>
            <View style={styles.whatsNextItem}>
              <View style={styles.whatsNextNumber}>
                <Text style={styles.whatsNextNumberText}>4</Text>
              </View>
              <Text style={styles.whatsNextText}>Track responder location in real-time</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => navigation.navigate('Tracking', { requestId: request.id })}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#DC2626', '#B91C1C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.trackGradient}
            >
              <Ionicons name="navigate" size={22} color="#FFFFFF" />
              <Text style={styles.trackButtonText}>View Live Tracking</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate('RequestHistory')}
            activeOpacity={0.7}
          >
            <Ionicons name="time" size={22} color="#1F2937" />
            <Text style={styles.historyButtonText}>View Request History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.7}
          >
            <Ionicons name="home" size={22} color="#6B7280" />
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 16,
  },
  errorButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Success icon
  successIconWrap: {
    marginBottom: 16,
    alignItems: 'center',
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#22C55E',
  },

  // Title
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#22C55E',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    paddingHorizontal: 10,
  },

  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
    gap: 10,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  quickActionShare: {
    backgroundColor: '#8B5CF6',
  },
  quickActionCall: {
    backgroundColor: '#DC2626',
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // ID card
  idCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  idLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 2,
    marginBottom: 4,
  },
  idValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 1,
  },
  idBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    gap: 6,
  },
  idDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  idBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F59E0B',
  },

  // Details card
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  typeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  detailSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 2,
    gap: 6,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
  },

  // Info banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    marginBottom: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#3B82F6',
    lineHeight: 18,
  },

  // What's Next
  whatsNextCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  whatsNextTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  whatsNextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  whatsNextNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsNextNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  whatsNextText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },

  // Buttons
  trackButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 12,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  trackGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  historyButtonText: {
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '600',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    width: '100%',
    gap: 10,
  },
  homeButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default ConfirmationScreen;