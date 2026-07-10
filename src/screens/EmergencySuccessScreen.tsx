// src/screens/EmergencySuccessScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  Vibration,
  Animated,
  StatusBar,
  Linking,
  Platform,
  Share,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const LOGO = require('../../assets/logo.png');
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 380;

interface EmergencySuccessScreenProps {
  navigation: any;
  route: any;
}

export const EmergencySuccessScreen = ({ navigation, route }: EmergencySuccessScreenProps) => {
  const { 
    emergencyType = 'medical',
    location = 'Current Location',
    responderName = 'Emergency Team',
    estimatedTime = '5-8 minutes',
    referenceId = 'EMG-' + Date.now().toString().slice(-6),
  } = route.params || {};

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Success animation sequence
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

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

    // Pulse animation for the status indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Vibration.vibrate([0, 100, 50, 100, 50, 200]);
  }, []);

  const getEmergencyIcon = () => {
    switch(emergencyType) {
      case 'medical':
        return <Ionicons name="medical" size={48} color="#FFFFFF" />;
      case 'fire':
        return <Ionicons name="flame" size={48} color="#FFFFFF" />;
      case 'police':
        return <Ionicons name="shield" size={48} color="#FFFFFF" />;
      case 'accident':
        return <Ionicons name="car" size={48} color="#FFFFFF" />;
      default:
        return <Ionicons name="alert-circle" size={48} color="#FFFFFF" />;
    }
  };

  const getEmergencyColor = () => {
    switch(emergencyType) {
      case 'medical':
        return '#DC2626';
      case 'fire':
        return '#F97316';
      case 'police':
        return '#3B82F6';
      case 'accident':
        return '#8B5CF6';
      default:
        return '#DC2626';
    }
  };

  const getEmergencyLabel = () => {
    switch(emergencyType) {
      case 'medical':
        return 'Medical Emergency';
      case 'fire':
        return 'Fire Emergency';
      case 'police':
        return 'Police Emergency';
      case 'accident':
        return 'Accident Report';
      default:
        return 'Emergency';
    }
  };

  const handleTrackResponder = () => {
    Vibration.vibrate(30);
    navigation.navigate('Tracking', {
      emergencyId: referenceId,
    });
  };

  const handleCallEmergency = () => {
    Vibration.vibrate(30);
    Alert.alert(
      'Emergency Call',
      'Call emergency services?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          style: 'destructive',
          onPress: () => {
            const phoneNumber = Platform.OS === 'android' ? 'tel:1122' : 'telprompt:1122';
            Linking.openURL(phoneNumber).catch(() => {
              Alert.alert('Error', 'Unable to make call. Please dial 1122 manually.');
            });
          }
        }
      ]
    );
  };

  const handleShareUpdate = async () => {
    Vibration.vibrate(20);
    try {
      await Share.share({
        message: `🚨 Emergency Update\n\nType: ${getEmergencyLabel()}\nLocation: ${location}\nResponder: ${responderName}\nETA: ${estimatedTime}\nReference: ${referenceId}\n\nSent via Emergency Response App`,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share.');
    }
  };

  const handleViewHistory = () => {
    Vibration.vibrate(20);
    navigation.navigate('RequestHistory');
  };

  const handleBackToHome = () => {
    Vibration.vibrate(20);
    navigation.navigate('Home');
  };

  const handleEmergencyTips = () => {
    Vibration.vibrate(20);
    Alert.alert(
      'Emergency Tips',
      'While waiting for help:\n\n1. Stay calm and keep others calm\n2. Keep your phone charged and accessible\n3. Follow responder instructions\n4. Keep emergency exits clear\n5. Stay in a safe location\n6. Keep emergency contacts updated',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#22C55E" />

      {/* Header */}
      <LinearGradient
        colors={['#22C55E', '#16A34A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={handleBackToHome}
            activeOpacity={0.7}
            style={styles.homeButton}
          >
            <Ionicons name="home" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image source={LOGO} style={styles.headerLogo} resizeMode="contain" />
            <Text style={styles.headerTitle}>Emergency Success</Text>
          </View>

          <TouchableOpacity
            onPress={handleShareUpdate}
            activeOpacity={0.7}
            style={styles.shareButton}
          >
            <Ionicons name="share" size={24} color="#FFFFFF" />
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
          {/* Success Icon */}
          <Animated.View
            style={[
              styles.successIconContainer,
              {
                transform: [{ scale: scaleAnim }],
                backgroundColor: getEmergencyColor(),
              },
            ]}
          >
            {getEmergencyIcon()}
          </Animated.View>

          <Text style={styles.successTitle}>Emergency Request Sent!</Text>
          <Text style={styles.successSubtitle}>
            Help is on the way. Stay calm and stay safe.
          </Text>

          {/* Emergency Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailsRow}>
              <View style={styles.detailsLabelContainer}>
                <Ionicons name="alert-circle" size={18} color="#DC2626" />
                <Text style={styles.detailsLabel}>Type</Text>
              </View>
              <Text style={styles.detailsValue}>{getEmergencyLabel()}</Text>
            </View>

            <View style={styles.detailsDivider} />

            <View style={styles.detailsRow}>
              <View style={styles.detailsLabelContainer}>
                <Ionicons name="location" size={18} color="#DC2626" />
                <Text style={styles.detailsLabel}>Location</Text>
              </View>
              <Text style={styles.detailsValue}>{location}</Text>
            </View>

            <View style={styles.detailsDivider} />

            <View style={styles.detailsRow}>
              <View style={styles.detailsLabelContainer}>
                <Ionicons name="person" size={18} color="#DC2626" />
                <Text style={styles.detailsLabel}>Responder</Text>
              </View>
              <Text style={styles.detailsValue}>{responderName}</Text>
            </View>

            <View style={styles.detailsDivider} />

            <View style={styles.detailsRow}>
              <View style={styles.detailsLabelContainer}>
                <Ionicons name="time" size={18} color="#DC2626" />
                <Text style={styles.detailsLabel}>ETA</Text>
              </View>
              <Text style={styles.detailsValue}>{estimatedTime}</Text>
            </View>

            <View style={styles.detailsDivider} />

            <View style={styles.detailsRow}>
              <View style={styles.detailsLabelContainer}>
                <Ionicons name="document-text" size={18} color="#DC2626" />
                <Text style={styles.detailsLabel}>Reference ID</Text>
              </View>
              <Text style={styles.detailsValue}>#{referenceId}</Text>
            </View>
          </View>

          {/* Status Indicator */}
          <View style={styles.statusContainer}>
            <Animated.View
              style={[
                styles.statusDot,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
            <Text style={styles.statusText}>Responder is on the way</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.trackButton]}
              onPress={handleTrackResponder}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate" size={22} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Track Responder</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.callButton]}
              onPress={handleCallEmergency}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={22} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Call Emergency</Text>
            </TouchableOpacity>
          </View>

          {/* Secondary Actions */}
          <View style={styles.secondaryActionsContainer}>
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={handleEmergencyTips}
              activeOpacity={0.7}
            >
              <View style={[styles.secondaryActionIcon, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="bulb" size={22} color="#DC2626" />
              </View>
              <Text style={styles.secondaryActionLabel}>Emergency Tips</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={handleViewHistory}
              activeOpacity={0.7}
            >
              <View style={[styles.secondaryActionIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="time" size={22} color="#3B82F6" />
              </View>
              <Text style={styles.secondaryActionLabel}>View History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={handleBackToHome}
              activeOpacity={0.7}
            >
              <View style={[styles.secondaryActionIcon, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="home" size={22} color="#22C55E" />
              </View>
              <Text style={styles.secondaryActionLabel}>Home</Text>
            </TouchableOpacity>
          </View>

          {/* Note */}
          <View style={styles.noteContainer}>
            <Ionicons name="information-circle" size={18} color="#6B7280" />
            <Text style={styles.noteText}>
              You will receive updates about your emergency request via notifications.
            </Text>
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
  homeButton: {
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
  shareButton: {
    padding: 4,
  },

  // Content
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  contentContainer: {
    paddingTop: 20,
    alignItems: 'center',
  },

  // Success Icon
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  successTitle: {
    fontSize: isSmallDevice ? 22 : 26,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: isSmallDevice ? 13 : 15,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },

  // Details Card
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailsLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsLabel: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailsValue: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#1F2937',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  detailsDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },

  // Status
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    marginRight: 10,
  },
  statusText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#065F46',
    fontWeight: '600',
  },

  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  trackButton: {
    backgroundColor: '#3B82F6',
  },
  callButton: {
    backgroundColor: '#DC2626',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 13 : 15,
    fontWeight: '600',
  },

  // Secondary Actions
  secondaryActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  secondaryAction: {
    alignItems: 'center',
    gap: 4,
  },
  secondaryActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryActionLabel: {
    fontSize: isSmallDevice ? 10 : 12,
    color: '#4B5563',
    fontWeight: '500',
  },

  // Note
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  noteText: {
    flex: 1,
    fontSize: isSmallDevice ? 11 : 12,
    color: '#6B7280',
    lineHeight: 18,
  },
});

export default EmergencySuccessScreen;