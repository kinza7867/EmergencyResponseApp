// src/screens/RequestDetailsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LOGO = require('../../assets/logo.png');
const { width } = Dimensions.get('window');
const isSmallDevice = width < 380;

interface RequestDetails {
  id: string;
  type: string;
  description: string;
  notes?: string;
  timestamp: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'cancelled';
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  responder?: {
    name: string;
    phone: string;
    eta: string;
  };
  timeline: Array<{
    time: string;
    status: string;
  }>;
}

export const RequestDetailsScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { requestId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<RequestDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDetails();
  }, [requestId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      // Mock data for demo
      const mockDetails: RequestDetails = {
        id: requestId || 'REQ-001',
        type: 'Medical Emergency',
        description: 'Patient experiencing severe chest pain and difficulty breathing. Requires immediate medical attention.',
        notes: 'Patient is conscious but in distress. Family member on site.',
        timestamp: new Date().toISOString(),
        status: 'pending',
        location: {
          address: '123 Main Street, Rawalpindi, Punjab',
          coordinates: { lat: 33.5651, lng: 73.0169 },
        },
        responder: {
          name: 'Dr. Ahmed Khan',
          phone: '+92-300-1234567',
          eta: '5-8 minutes',
        },
        timeline: [
          { time: new Date(Date.now() - 600000).toISOString(), status: 'Request Submitted' },
          { time: new Date(Date.now() - 300000).toISOString(), status: 'Dispatched to Responder' },
          { time: new Date(Date.now() - 60000).toISOString(), status: 'Responder En Route' },
        ],
      };
      setDetails(mockDetails);
    } catch (err) {
      setError('An error occurred while loading details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return '#10B981';
      case 'in-progress': return '#3B82F6';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'resolved': return '#D1FAE5';
      case 'in-progress': return '#DBEAFE';
      case 'pending': return '#FEF3C7';
      case 'cancelled': return '#FEE2E2';
      default: return '#F3F4F6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return '✅';
      case 'in-progress': return '🔄';
      case 'pending': return '⏳';
      case 'cancelled': return '❌';
      default: return '📌';
    }
  };

  const handleTrackEmergency = () => {
    navigation.navigate('Tracking', { requestId: details?.id });
  };

  const handleCancelRequest = () => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this emergency request?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('✅ Request Cancelled', 'Your request has been cancelled.');
            navigation.goBack();
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
        <LinearGradient
          colors={['#DC2626', '#991B1B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.loadingHeader, { paddingTop: insets.top + 8 }]}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Image source={LOGO} style={styles.headerLogo} resizeMode="contain" />
              <Text style={styles.headerTitle}>Request Details</Text>
            </View>
            <View style={styles.headerPlaceholder} />
          </View>
        </LinearGradient>
        <View style={styles.loadingCenter}>
          <Text style={styles.loadingEmoji}>⏳</Text>
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </View>
    );
  }

  if (error || !details) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
        <LinearGradient
          colors={['#DC2626', '#991B1B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.header, { paddingTop: insets.top + 8 }]}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Image source={LOGO} style={styles.headerLogo} resizeMode="contain" />
              <Text style={styles.headerTitle}>Request Details</Text>
            </View>
            <View style={styles.headerPlaceholder} />
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>❌</Text>
          <Text style={styles.errorText}>{error || 'Request not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDetails}>
            <LinearGradient
              colors={['#DC2626', '#B91C1C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.retryGradient}
            >
              <Text style={styles.retryText}>Retry</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
      
      {/* Full Width Red Header */}
      <LinearGradient
        colors={['#DC2626', '#991B1B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Image source={LOGO} style={styles.headerLogo} resizeMode="contain" />
            <Text style={styles.headerTitle}>Request Details</Text>
          </View>
          <TouchableOpacity onPress={fetchDetails} style={styles.refreshButton}>
            <Text style={styles.refreshText}>↻</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.requestId}>#{details.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(details.status) }]}>
              <Text style={[styles.statusText, { color: getStatusColor(details.status) }]}>
                {getStatusIcon(details.status)} {details.status.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.emergencyType}>🚨 {details.type}</Text>
          <Text style={styles.timestamp}>🕐 {formatDate(details.timestamp)}</Text>
        </View>

        {/* Description Card */}
        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>📋 Description</Text>
          <Text style={styles.description}>{details.description}</Text>
          {details.notes && (
            <Text style={styles.notes}>📝 Notes: {details.notes}</Text>
          )}
        </View>

        {/* Responder Card */}
        {details.responder && (
          <View style={styles.detailCard}>
            <Text style={styles.cardTitle}>👨‍⚕️ Responder Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>👤</Text>
              <Text style={styles.infoText}>{details.responder.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📞</Text>
              <Text style={styles.infoText}>{details.responder.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>⏱️</Text>
              <Text style={styles.infoText}>ETA: {details.responder.eta}</Text>
            </View>
          </View>
        )}

        {/* Location Card */}
        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>📍 Location</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText}>{details.location.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🌐</Text>
            <Text style={styles.coordinatesText}>
              {details.location.coordinates.lat.toFixed(4)}, {details.location.coordinates.lng.toFixed(4)}
            </Text>
          </View>
        </View>

        {/* Timeline Card */}
        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>⏰ Timeline</Text>
          {details.timeline.map((item, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineStatus}>{item.status}</Text>
                <Text style={styles.timelineTime}>{formatDate(item.time)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {details.status === 'pending' && (
            <TouchableOpacity style={styles.trackButton} onPress={handleTrackEmergency}>
              <LinearGradient
                colors={['#DC2626', '#B91C1C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.trackGradient}
              >
                <Text style={styles.trackButtonText}>📡 Track Emergency</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {(details.status === 'pending' || details.status === 'in-progress') && (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelRequest}>
              <Text style={styles.cancelButtonText}>❌ Cancel Request</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Header
  header: {
    paddingBottom: 16,
  },
  loadingHeader: {
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
  backText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
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
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerPlaceholder: {
    width: 40,
  },
  refreshButton: {
    padding: 4,
  },
  refreshText: {
    fontSize: 20,
    color: '#FFFFFF',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },

  // Status Card
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emergencyType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  // Detail Card
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 6,
  },
  notes: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 10,
    width: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#1F2937',
  },
  coordinatesText: {
    fontSize: 13,
    color: '#6B7280',
  },

  // Timeline
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626',
    marginRight: 12,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  timelineTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },

  // Actions
  actionContainer: {
    marginTop: 4,
    gap: 10,
  },
  trackButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  trackGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryGradient: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    alignItems: 'center',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default RequestDetailsScreen;