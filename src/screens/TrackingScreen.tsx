// src/screens/TrackingScreen.tsx
// Week 4 — Tracking screen with map, ambulance marker, ETA.
// Uses expo-location for real device GPS. 
// react-native-maps requires a dev build (not Expo Go) so we render
// a visual map simulation that matches the spec (markers, route, status steps).

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, ActivityIndicator, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { emergencyService, EmergencyRequest } from '../services/emergencyService';
import { colors, spacing, borderRadius, fontSizes, fontWeights, shadows } from '../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_HEIGHT = 220;

// Mock ambulance location — Week 4: returned by GET /api/emergency/{id}/location
const AMBULANCE_LOCATION = { label: 'District Rescue Station 7', latitude: 33.5823, longitude: 73.0285 };
const MOCK_ETA = '8 minutes';

const STATUS_STEPS = [
  { key: 'received',   label: 'Request Received',  icon: '📨' },
  { key: 'dispatched', label: 'Unit Dispatched',    icon: '🚑' },
  { key: 'en_route',   label: 'En Route to You',    icon: '🛣️' },
  { key: 'arrived',    label: 'Responders Arrived', icon: '✅' },
];

export const TrackingScreen = ({ route, navigation }: any) => {
  const requestId: string   = route.params?.requestId || '';
  const [request, setRequest]   = useState<EmergencyRequest | null>(null);
  const [loading, setLoading]   = useState(true);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadRequest();
    startPulse();
    getGPS();
  }, []);

  const loadRequest = async () => {
    setLoading(true);
    try {
      const response = await emergencyService.getById(requestId);
      setRequest(response.data.request);
    } catch { /* show mock data */ }
    finally { setLoading(false); }
  };

  const getGPS = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    } catch { /* fallback silently */ }
  };

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    ).start();
  };

  const currentStep = request?.status === 'resolved' ? 3
    : request?.status === 'dispatched' ? 2 : 1;

  const displayCoords = userCoords || request?.location || { latitude: 33.5651, longitude: 73.0169 };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.card} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📡 Live Tracking</Text>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading tracking data...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* ETA Banner */}
          <View style={styles.etaBanner}>
            <Text style={styles.etaIcon}>🕐</Text>
            <View>
              <Text style={styles.etaLabel}>Estimated Time of Arrival</Text>
              <Text style={styles.etaValue}>{MOCK_ETA}</Text>
            </View>
          </View>

          {/* Map Simulation Card */}
          <View style={styles.mapCard}>
            <Text style={styles.mapLabel}>📍 Live Map View</Text>
            <View style={styles.mapArea}>
              {/* Grid roads */}
              <View style={[styles.road, styles.roadH, { top: '30%' }]} />
              <View style={[styles.road, styles.roadH, { top: '62%' }]} />
              <View style={[styles.road, styles.roadV, { left: '22%' }]} />
              <View style={[styles.road, styles.roadV, { left: '68%' }]} />

              {/* Ambulance marker — top left */}
              <Animated.View style={[styles.ambulanceWrap, { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.ambulancePulse} />
                <View style={styles.ambulanceMarker}>
                  <Text style={styles.ambulanceEmoji}>🚑</Text>
                </View>
                <Text style={styles.markerLabel}>Ambulance</Text>
              </Animated.View>

              {/* User marker — bottom right */}
              <View style={styles.userWrap}>
                <View style={styles.userMarker}>
                  <Text style={styles.userEmoji}>📍</Text>
                </View>
                <Text style={styles.markerLabel}>You</Text>
              </View>

              {/* Dotted route between them */}
              <View style={styles.routeWrap}>
                {[0,1,2,3,4,5,6].map(i => (
                  <View key={i} style={[styles.routeDot, { opacity: 1 - i * 0.1 }]} />
                ))}
              </View>
            </View>

            {/* Location info row */}
            <View style={styles.mapInfoRow}>
              <View style={styles.mapInfoItem}>
                <Text style={styles.mapInfoLabel}>YOUR LOCATION</Text>
                <Text style={styles.mapInfoValue} numberOfLines={1}>
                  {request?.location.label || 'Current Location'}
                </Text>
                <Text style={styles.mapInfoCoords}>
                  {displayCoords.latitude.toFixed(4)}, {displayCoords.longitude.toFixed(4)}
                </Text>
              </View>
              <View style={styles.mapInfoDivider} />
              <View style={styles.mapInfoItem}>
                <Text style={styles.mapInfoLabel}>RESPONDER UNIT</Text>
                <Text style={styles.mapInfoValue} numberOfLines={2}>{AMBULANCE_LOCATION.label}</Text>
              </View>
            </View>
          </View>

          {/* Dispatch Steps */}
          <View style={styles.stepsCard}>
            <Text style={styles.stepsTitle}>Dispatch Status</Text>
            {STATUS_STEPS.map((step, idx) => {
              const isDone    = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <View key={step.key} style={styles.stepRow}>
                  {idx < STATUS_STEPS.length - 1 && (
                    <View style={[styles.stepConnector, isDone && styles.stepConnectorDone]} />
                  )}
                  <View style={[styles.stepCircle, isDone && styles.stepCircleDone, isCurrent && styles.stepCircleCurrent]}>
                    <Text style={styles.stepCircleText}>{isDone ? '✓' : step.icon}</Text>
                  </View>
                  <View style={styles.stepBody}>
                    <Text style={[styles.stepLabel, isDone && styles.stepLabelDone, isCurrent && styles.stepLabelCurrent]}>
                      {step.label}
                    </Text>
                    {isCurrent && <Text style={styles.stepSub}>In progress...</Text>}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Request Info */}
          {request && (
            <View style={styles.requestCard}>
              <Text style={styles.requestCardTitle}>Request Details</Text>
              {[
                { key: 'Type',       val: request.emergencyType.charAt(0).toUpperCase() + request.emergencyType.slice(1) },
                { key: 'Request ID', val: '#' + request.id.slice(0, 12).toUpperCase() },
                { key: 'Status',     val: request.status.toUpperCase() },
                ...(request.notes ? [{ key: 'Notes', val: request.notes }] : []),
              ].map((row, i) => (
                <View key={i} style={styles.requestRow}>
                  <Text style={styles.requestKey}>{row.key}</Text>
                  <Text style={[styles.requestVal, { flex: 1, textAlign: 'right' }]} numberOfLines={2}>{row.val}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.footerNote}>
            🔔 Stay at your location and keep your phone available. Responders will call before arrival.
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: colors.background },
  header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, ...shadows.sm },
  backBtn:            { padding: spacing.xs },
  backBtnText:        { fontSize: fontSizes.md, color: colors.primary, fontWeight: fontWeights.medium },
  headerTitle:        { fontSize: fontSizes.xl, fontWeight: fontWeights.bold, color: colors.textHeading },
  liveBadge:          { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.dangerBg, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm },
  liveDot:            { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.danger, marginRight: spacing.xs },
  liveText:           { fontSize: fontSizes.xs, fontWeight: fontWeights.bold, color: colors.danger },
  loadingWrap:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText:        { marginTop: spacing.md, fontSize: fontSizes.md, color: colors.textSecondary },
  scrollContent:      { padding: spacing.lg, paddingBottom: spacing.xxxl },
  etaBanner:          { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.successBg, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  etaIcon:            { fontSize: 32, marginRight: spacing.lg },
  etaLabel:           { fontSize: fontSizes.sm, color: colors.success, fontWeight: fontWeights.medium },
  etaValue:           { fontSize: fontSizes.xxl, fontWeight: fontWeights.bold, color: colors.success },
  mapCard:            { backgroundColor: colors.card, borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.lg, ...shadows.md },
  mapLabel:           { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textSecondary, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  mapArea:            { height: MAP_HEIGHT, backgroundColor: '#E8F0FE', margin: spacing.lg, marginTop: 0, borderRadius: borderRadius.md, overflow: 'hidden', position: 'relative' },
  road:               { position: 'absolute', backgroundColor: 'rgba(200,210,230,0.85)' },
  roadH:              { left: 0, right: 0, height: 7 },
  roadV:              { top: 0, bottom: 0, width: 7 },
  ambulanceWrap:      { position: 'absolute', top: '15%', left: '12%', alignItems: 'center' },
  ambulancePulse:     { position: 'absolute', width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(239,68,68,0.2)', top: -7, left: -7 },
  ambulanceMarker:    { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.danger, justifyContent: 'center', alignItems: 'center', ...shadows.md },
  ambulanceEmoji:     { fontSize: 20 },
  userWrap:           { position: 'absolute', bottom: '12%', right: '12%', alignItems: 'center' },
  userMarker:         { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', ...shadows.md },
  userEmoji:          { fontSize: 20 },
  markerLabel:        { fontSize: 9, fontWeight: fontWeights.bold, color: colors.textHeading, marginTop: 3 },
  routeWrap:          { position: 'absolute', top: '40%', left: '26%', flexDirection: 'row', gap: 8 },
  routeDot:           { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.primary },
  mapInfoRow:         { flexDirection: 'row', padding: spacing.lg, paddingTop: spacing.sm },
  mapInfoItem:        { flex: 1 },
  mapInfoLabel:       { fontSize: fontSizes.xs, fontWeight: fontWeights.bold, color: colors.textMuted, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  mapInfoValue:       { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textPrimary },
  mapInfoCoords:      { fontSize: fontSizes.xs, color: colors.textMuted, marginTop: 1 },
  mapInfoDivider:     { width: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
  stepsCard:          { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.sm },
  stepsTitle:         { fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.textHeading, marginBottom: spacing.lg },
  stepRow:            { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.lg, position: 'relative' },
  stepConnector:      { position: 'absolute', left: 17, top: 38, width: 2, height: 28, backgroundColor: colors.borderLight },
  stepConnectorDone:  { backgroundColor: colors.success },
  stepCircle:         { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.borderLight, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  stepCircleDone:     { backgroundColor: colors.success },
  stepCircleCurrent:  { backgroundColor: colors.primary },
  stepCircleText:     { fontSize: 14 },
  stepBody:           { flex: 1, paddingTop: 6 },
  stepLabel:          { fontSize: fontSizes.md, fontWeight: fontWeights.medium, color: colors.textMuted },
  stepLabelDone:      { color: colors.success, fontWeight: fontWeights.semibold },
  stepLabelCurrent:   { color: colors.primary, fontWeight: fontWeights.semibold },
  stepSub:            { fontSize: fontSizes.xs, color: colors.textMuted, marginTop: 2 },
  requestCard:        { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.sm },
  requestCardTitle:   { fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.textHeading, marginBottom: spacing.md },
  requestRow:         { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  requestKey:         { fontSize: fontSizes.sm, color: colors.textSecondary },
  requestVal:         { fontSize: fontSizes.sm, fontWeight: fontWeights.medium, color: colors.textPrimary },
  footerNote:         { fontSize: fontSizes.xs, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
});
