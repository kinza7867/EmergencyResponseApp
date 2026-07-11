// src/screens/TrackingScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 380;
const isTablet = width >= 768;
const MAP_HEIGHT = isSmallDevice ? 180 : 220;

const STATUS_STEPS = [
  { key: 'received', label: 'Request Received', icon: 'mail' },
  { key: 'dispatched', label: 'Unit Dispatched', icon: 'car' },
  { key: 'en_route', label: 'En Route to You', icon: 'navigate' },
  { key: 'arriving', label: 'Almost There', icon: 'location' },
  { key: 'arrived', label: 'Responders Arrived', icon: 'checkmark-circle' },
];

// Mock ambulance route
const AMBULANCE_ROUTES = [
  { latitude: 33.5751, longitude: 73.0269 },
  { latitude: 33.5771, longitude: 73.0249 },
  { latitude: 33.5791, longitude: 73.0229 },
  { latitude: 33.5811, longitude: 73.0209 },
  { latitude: 33.5831, longitude: 73.0189 },
  { latitude: 33.5851, longitude: 73.0169 },
  { latitude: 33.5871, longitude: 73.0149 },
];

export const TrackingScreen = ({ route, navigation }: any) => {
  const requestId: string = route.params?.requestId || '';

  // State
  const [loading, setLoading] = useState(true);
  const [ambulanceIndex, setAmbulanceIndex] = useState(0);
  const [eta, setEta] = useState('8 min');
  const [status, setStatus] = useState('dispatched');
  const [request, setRequest] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  // Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ambulanceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // User location (mock)
  const userLocation = {
    latitude: 33.5651,
    longitude: 73.0169,
  };

  // Ambulance location
  const ambulanceLocation = AMBULANCE_ROUTES[ambulanceIndex] || AMBULANCE_ROUTES[0];

  useEffect(() => {
    loadRequest();
    startPulse();
    startAmbulanceSimulation();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    return () => {
      // Cleanup if needed
    };
  }, []);

  const loadRequest = async () => {
    setLoading(true);
    setTimeout(() => {
      setRequest({
        id: requestId || 'REQ-12345',
        emergencyType: 'medical',
        status: 'dispatched',
        notes: 'Patient needs immediate attention',
        location: {
          label: 'Rawalpindi, Punjab',
          latitude: 33.5651,
          longitude: 73.0169,
        },
        createdAt: new Date().toISOString(),
      });
      setLoading(false);
    }, 1000);
  };

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startAmbulanceSimulation = () => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % AMBULANCE_ROUTES.length;
      setAmbulanceIndex(index);

      // Update progress
      const newProgress = (index / (AMBULANCE_ROUTES.length - 1)) * 100;
      setProgress(newProgress);

      // Update ETA based on progress
      const etaMinutes = Math.max(1, Math.round(8 * (1 - newProgress / 100)));
      setEta(`${etaMinutes} min`);

      if (etaMinutes <= 1) {
        setStatus('arriving');
      } else if (index > 0) {
        setStatus('en_route');
      }

      // Stop when arrived
      if (index === AMBULANCE_ROUTES.length - 1) {
        setStatus('arrived');
        setEta('Arrived');
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  const currentStepIndex = STATUS_STEPS.findIndex(
    (step) => step.key === status
  );
  const currentStep = currentStepIndex >= 0 ? currentStepIndex : 1;

  const getStatusColor = () => {
    switch (status) {
      case 'arrived': return '#22C55E';
      case 'arriving': return '#F59E0B';
      case 'en_route': return '#3B82F6';
      default: return '#DC2626';
    }
  };

  const getStatusBgColor = () => {
    switch (status) {
      case 'arrived': return '#F0FDF4';
      case 'arriving': return '#FFFBEB';
      case 'en_route': return '#EFF6FF';
      default: return '#FEF2F2';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'arrived': return 'Responders Arrived';
      case 'arriving': return 'Almost There';
      case 'en_route': return 'En Route';
      default: return 'Dispatched';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'arrived': return 'checkmark-circle';
      case 'arriving': return 'location';
      case 'en_route': return 'navigate';
      default: return 'car';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>Loading tracking data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#DC2626" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="navigate" size={20} color="#DC2626" />
          <Text style={styles.headerTitle}>Live Tracking</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
          {/* ETA Banner */}
          <View style={[styles.etaBanner, { backgroundColor: getStatusBgColor() }]}>
            <View style={[styles.etaIconContainer, { backgroundColor: getStatusColor() + '20' }]}>
              <Ionicons name="time" size={28} color={getStatusColor()} />
            </View>
            <View style={styles.etaContent}>
              <Text style={styles.etaLabel}>Estimated Time of Arrival</Text>
              <Text style={[styles.etaValue, { color: getStatusColor() }]}>{eta}</Text>
            </View>
          </View>

          {/* Status Bar */}
          <View style={styles.statusBar}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor() }]}>
              <Ionicons name={getStatusIcon()} size={16} color={getStatusColor()} />
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusLabel()}
              </Text>
            </View>
            <Text style={styles.requestIdText}>ID: {request?.id?.toUpperCase() || 'N/A'}</Text>
          </View>

          {/* Map Simulation Card */}
          <View style={styles.mapCard}>
            <Text style={styles.mapLabel}>Live Map View</Text>
            <View style={styles.mapArea}>
              {/* Grid roads */}
              <View style={[styles.road, styles.roadH, { top: '30%' }]} />
              <View style={[styles.road, styles.roadH, { top: '62%' }]} />
              <View style={[styles.road, styles.roadV, { left: '22%' }]} />
              <View style={[styles.road, styles.roadV, { left: '68%' }]} />

              {/* Progress route line */}
              <View style={styles.routeLine}>
                <View style={[styles.routeProgress, { width: `${progress}%` }]} />
              </View>

              {/* Ambulance marker */}
              <Animated.View
                style={[
                  styles.ambulanceWrap,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <View style={[styles.ambulancePulse, { borderColor: getStatusColor() }]} />
                <View style={[styles.ambulanceMarker, { backgroundColor: getStatusColor() }]}>
                  <FontAwesome5 name="ambulance" size={isSmallDevice ? 16 : 20} color="#FFFFFF" />
                </View>
                <Text style={styles.markerLabel}>Ambulance</Text>
              </Animated.View>

              {/* User marker */}
              <View style={styles.userWrap}>
                <View style={styles.userMarker}>
                  <Ionicons name="person" size={isSmallDevice ? 16 : 20} color="#FFFFFF" />
                </View>
                <Text style={styles.markerLabel}>You</Text>
              </View>

              {/* Progress indicator */}
              <View style={styles.progressIndicator}>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              </View>
            </View>

            {/* Location info row */}
            <View style={styles.mapInfoRow}>
              <View style={styles.mapInfoItem}>
                <Text style={styles.mapInfoLabel}>Your Location</Text>
                <Text style={styles.mapInfoValue} numberOfLines={1}>
                  {request?.location?.label || 'Current Location'}
                </Text>
                <Text style={styles.mapInfoCoords}>
                  {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </Text>
              </View>
              <View style={styles.mapInfoDivider} />
              <View style={styles.mapInfoItem}>
                <Text style={styles.mapInfoLabel}>Responder Unit</Text>
                <Text style={styles.mapInfoValue} numberOfLines={2}>
                  District Rescue Station 7
                </Text>
                <Text style={styles.mapInfoCoords}>
                  {ambulanceLocation.latitude.toFixed(4)}, {ambulanceLocation.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
          </View>

          {/* Dispatch Steps */}
          <View style={styles.stepsCard}>
            <Text style={styles.stepsTitle}>Dispatch Status</Text>
            {STATUS_STEPS.map((step, idx) => {
              const isDone = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <View key={step.key} style={styles.stepRow}>
                  <View
                    style={[
                      styles.stepCircle,
                      isDone && styles.stepCircleDone,
                      isCurrent && styles.stepCircleCurrent,
                    ]}
                  >
                    {isDone ? (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    ) : isCurrent ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name={step.icon as any} size={16} color="#9CA3AF" />
                    )}
                  </View>
                  <View style={styles.stepBody}>
                    <Text
                      style={[
                        styles.stepLabel,
                        isDone && styles.stepLabelDone,
                        isCurrent && styles.stepLabelCurrent,
                      ]}
                    >
                      {step.label}
                    </Text>
                    {isCurrent && (
                      <Text style={styles.stepSub}>In progress...</Text>
                    )}
                  </View>
                  {isDone && (
                    <View style={styles.stepCheck}>
                      <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Request Info */}
          {request && (
            <View style={styles.requestCard}>
              <Text style={styles.requestCardTitle}>Request Details</Text>
              {[
                {
                  key: 'Type',
                  val:
                    request.emergencyType?.charAt(0).toUpperCase() +
                    request.emergencyType?.slice(1) || 'Emergency',
                },
                {
                  key: 'Request ID',
                  val: '#' + (request.id?.slice(0, 12) || 'N/A').toUpperCase(),
                },
                { key: 'Status', val: request.status?.toUpperCase() || 'PENDING' },
                ...(request.notes ? [{ key: 'Notes', val: request.notes }] : []),
              ].map((row, i) => (
                <View key={i} style={styles.requestRow}>
                  <Text style={styles.requestKey}>{row.key}</Text>
                  <Text
                    style={[styles.requestVal, { flex: 1, textAlign: 'right' }]}
                    numberOfLines={2}
                  >
                    {row.val}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Footer Note */}
          <View style={styles.footerNoteContainer}>
            <Ionicons name="information-circle" size={18} color="#6B7280" />
            <Text style={styles.footerNote}>
              Stay at your location and keep your phone available. Responders will call before arrival.
            </Text>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtn: {
    padding: 4,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // ETA Banner
  etaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  etaIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  etaContent: {
    flex: 1,
  },
  etaLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  etaValue: {
    fontSize: isSmallDevice ? 22 : 26,
    fontWeight: '800',
  },

  // Status Bar
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  requestIdText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // Map Card
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  mapLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  mapArea: {
    height: MAP_HEIGHT,
    backgroundColor: '#E8F0FE',
    margin: 14,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  road: {
    position: 'absolute',
    backgroundColor: 'rgba(200,210,230,0.85)',
  },
  roadH: {
    left: 0,
    right: 0,
    height: 6,
  },
  roadV: {
    top: 0,
    bottom: 0,
    width: 6,
  },
  routeLine: {
    position: 'absolute',
    top: '40%',
    left: '18%',
    right: '18%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  routeProgress: {
    height: '100%',
    backgroundColor: '#DC2626',
    borderRadius: 2,
  },
  ambulanceWrap: {
    position: 'absolute',
    top: '15%',
    left: '12%',
    alignItems: 'center',
  },
  ambulancePulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(239,68,68,0.15)',
    top: -5,
    left: -5,
    borderWidth: 2,
  },
  ambulanceMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  userWrap: {
    position: 'absolute',
    bottom: '12%',
    right: '12%',
    alignItems: 'center',
  },
  userMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  markerLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 3,
  },
  progressIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  mapInfoRow: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  mapInfoItem: {
    flex: 1,
  },
  mapInfoLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mapInfoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  mapInfoCoords: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 1,
  },
  mapInfoDivider: {
    width: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 12,
  },

  // Steps Card
  stepsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  stepsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepCircleDone: {
    backgroundColor: '#22C55E',
  },
  stepCircleCurrent: {
    backgroundColor: '#DC2626',
  },
  stepBody: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  stepLabelDone: {
    color: '#22C55E',
    fontWeight: '600',
  },
  stepLabelCurrent: {
    color: '#DC2626',
    fontWeight: '600',
  },
  stepSub: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  stepCheck: {
    marginLeft: 4,
  },

  // Request Card
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  requestCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  requestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  requestKey: {
    fontSize: 13,
    color: '#6B7280',
  },
  requestVal: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
  },

  // Footer
  footerNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    gap: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  footerNote: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
});

export default TrackingScreen;