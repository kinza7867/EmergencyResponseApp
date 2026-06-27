// src/screens/ConfirmationScreen.tsx
// Week 2 — shown after a successful SOS submission.
// Displays the Request ID, type, location, and status.
// Has a "View Tracking" button (Week 3 — Map screen) and "Back to Home".

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmergencyRequest } from '../services/emergencyService';
import { colors, spacing, borderRadius, fontSizes, fontWeights, shadows } from '../styles/theme';

const TYPE_META: Record<string, { icon: string; color: string; bgColor: string }> = {
  medical:  { icon: '🚑', color: colors.danger,        bgColor: colors.dangerBg },
  fire:     { icon: '🔥', color: colors.fire,          bgColor: colors.fireBg },
  police:   { icon: '👮', color: colors.police,        bgColor: colors.policeBg },
  accident: { icon: '🚗', color: colors.accident,      bgColor: colors.accidentBg },
  other:    { icon: '📞', color: colors.textSecondary, bgColor: colors.borderLight },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export const ConfirmationScreen = ({ route, navigation }: any) => {
  // The submitted EmergencyRequest is passed via navigation params
  const request: EmergencyRequest = route.params?.request;

  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Bounce-in animation for the success icon
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  if (!request) {
    // Fallback if screen is opened without params
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No request data found.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.linkText}>Go Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const meta = TYPE_META[request.emergencyType] || TYPE_META.other;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Success Icon */}
        <Animated.View style={[styles.successIconWrap, { transform: [{ scale: scaleAnim }], opacity: fadeAnim }]}>
          <View style={styles.successCircle}>
            <Text style={styles.successCheck}>✅</Text>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>Alert Dispatched!</Text>
          <Text style={styles.subtitle}>
            Your emergency request has been submitted. Help is on the way.
          </Text>

          {/* Request ID Card */}
          <View style={styles.idCard}>
            <Text style={styles.idLabel}>REQUEST ID</Text>
            <Text style={styles.idValue}>{request.id.toUpperCase()}</Text>
          </View>

          {/* Details Card */}
          <View style={styles.detailsCard}>

            <View style={[styles.typeRow, { backgroundColor: meta.bgColor }]}>
              <Text style={styles.typeIcon}>{meta.icon}</Text>
              <Text style={[styles.typeText, { color: meta.color }]}>
                {request.emergencyType.toUpperCase()} EMERGENCY
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📍</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{request.location.label}</Text>
                <Text style={styles.detailSub}>
                  {request.location.latitude.toFixed(4)}, {request.location.longitude.toFixed(4)}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>🕐</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Submitted At</Text>
                <Text style={styles.detailValue}>{formatDate(request.createdAt)}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📊</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>⏳ PENDING — Awaiting dispatch</Text>
                </View>
              </View>
            </View>

            {request.notes ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📝</Text>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Your Notes</Text>
                  <Text style={styles.detailValue}>{request.notes}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              🔔 You will be notified when your request status changes. Keep your phone nearby.
            </Text>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => navigation.navigate('Tracking', { requestId: request.id })}
          >
            <Text style={styles.trackButtonText}>📡 View Live Tracking</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate('RequestHistory')}
          >
            <Text style={styles.historyButtonText}>📋 View Request History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('Main')}
          >
            <Text style={styles.homeButtonText}>🏠 Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSizes.lg,
    color: colors.danger,
    textAlign: 'center',
    marginTop: 40,
  },
  linkText: {
    fontSize: fontSizes.md,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },

  // Success icon
  successIconWrap: {
    marginTop: spacing.xxxl,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.successBg,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  successCheck: {
    fontSize: 48,
  },

  // Title
  title: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    color: colors.success,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },

  // ID card
  idCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  idLabel: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  idValue: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textHeading,
    letterSpacing: 1,
  },

  // Details card
  detailsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    width: '100%',
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  typeIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  typeText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailIcon: {
    fontSize: 18,
    marginRight: spacing.md,
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    color: colors.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    fontWeight: fontWeights.medium,
  },
  detailSub: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    color: colors.warning,
  },

  // Info banner
  infoBanner: {
    backgroundColor: colors.primaryBg,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.xl,
  },
  infoBannerText: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    lineHeight: 18,
    textAlign: 'center',
  },

  // Buttons
  trackButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.primary,
  },
  trackButtonText: {
    color: colors.textWhite,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  historyButton: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  historyButtonText: {
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  homeButton: {
    paddingVertical: spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  homeButtonText: {
    color: colors.textSecondary,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  },
});
