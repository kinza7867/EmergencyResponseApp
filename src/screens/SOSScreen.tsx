// src/screens/SOSScreen.tsx
// Week 2 & 4 — SOS Home screen
// Week 2: type picker, notes, static location, submit → POST /api/emergency → ConfirmationScreen
// Week 4: real GPS via expo-location replaces mock location

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, ActivityIndicator, StatusBar,
  Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { emergencyService } from '../services/emergencyService';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 380;

interface EmergencyType {
  key: string; label: string; icon: string; color: string; bgColor: string;
}

const EMERGENCY_TYPES: EmergencyType[] = [
  { key: 'medical',  label: 'Medical',  icon: '🚑', color: '#DC2626', bgColor: '#FEE2E2' },
  { key: 'fire',     label: 'Fire',     icon: '🔥', color: '#EA580C', bgColor: '#FFEDD5' },
  { key: 'police',   label: 'Police',   icon: '👮', color: '#2563EB', bgColor: '#DBEAFE' },
  { key: 'accident', label: 'Accident', icon: '🚗', color: '#7C3AED', bgColor: '#EDE9FE' },
  { key: 'other',    label: 'Other',    icon: '📞', color: '#6B7280', bgColor: '#F3F4F6' },
];

export const SOSScreen = ({ navigation }: any) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [notes, setNotes]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [locLoading, setLocLoading]     = useState(false);
  const [userId, setUserId]             = useState('');
  const [userName, setUserName]         = useState('');
  const [location, setLocation]         = useState<{
    label: string; latitude: number; longitude: number;
  }>({ label: 'Fetching location...', latitude: 0, longitude: 0 });

  useEffect(() => {
    const init = async () => {
      try {
        const raw = await AsyncStorage.getItem('userData');
        if (raw) {
          const user = JSON.parse(raw);
          setUserId(user.id || 'user-1');
          setUserName(user.name || 'User');
        }
      } catch { setUserId('user-1'); setUserName('User'); }
      await fetchLocation();
    };
    init();
  }, []);

  const fetchLocation = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation({ label: 'Rawalpindi, Punjab (fallback)', latitude: 33.5651, longitude: 73.0169 });
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = pos.coords;
      const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
      const g   = geo[0];
      const label = [g?.city, g?.region, g?.country].filter(Boolean).join(', ') || 'Current Location';
      setLocation({ label, latitude, longitude });
    } catch {
      setLocation({ label: 'Rawalpindi, Punjab (fallback)', latitude: 33.5651, longitude: 73.0169 });
    } finally {
      setLocLoading(false);
    }
  };

  const validateForm = () => {
    if (!selectedType) {
      Alert.alert('Select Emergency Type', 'Please choose the type of emergency before submitting.');
      return false;
    }
    if (location.latitude === 0 && !locLoading) {
      Alert.alert('Location Required', 'Unable to get location. Please try refreshing.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await emergencyService.submitRequest({
        userId, userName, emergencyType: selectedType,
        notes: notes.trim(), location,
      });
      if (response.success) {
        navigation.navigate('Confirmation', { request: response.data.request });
        setSelectedType('');
        setNotes('');
      }
    } catch (error: any) {
      Alert.alert('Submission Failed', error.message || 'Could not submit SOS. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedTypeObj = EMERGENCY_TYPES.find(t => t.key === selectedType);
  const isReady = location.latitude !== 0;

  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={['#FEF2F2', '#FEE2E2', '#FCA5A5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.backIcon}>←</Text>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>🚨 Send SOS Alert</Text>
              <View style={styles.subtitleContainer}>
                <View style={styles.subtitleLine} />
                <Text style={styles.subtitle}>Help is dispatched immediately</Text>
                <View style={styles.subtitleLine} />
              </View>
            </View>

            {/* Form Card */}
            <View style={styles.cardContainer}>
              {/* Emergency Type Picker */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Select Emergency Type *</Text>
                <View style={styles.typeGrid}>
                  {EMERGENCY_TYPES.map(type => {
                    const isSel = selectedType === type.key;
                    return (
                      <TouchableOpacity
                        key={type.key}
                        style={[
                          styles.typeCard, 
                          isSel && { 
                            backgroundColor: type.bgColor, 
                            borderColor: type.color, 
                            borderWidth: 2 
                          }
                        ]}
                        onPress={() => setSelectedType(type.key)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.typeIcon}>{type.icon}</Text>
                        <Text style={[styles.typeLabel, isSel && { color: type.color, fontWeight: '700' }]}>
                          {type.label}
                        </Text>
                        {isSel && <View style={[styles.selectedDot, { backgroundColor: type.color }]} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Live GPS Location */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>📍 Current Location</Text>
                <View style={styles.locationCard}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <View style={styles.locationTextContainer}>
                    {locLoading ? (
                      <ActivityIndicator size="small" color="#DC2626" />
                    ) : (
                      <>
                        <Text style={styles.locationCity}>{location.label}</Text>
                        {location.latitude !== 0 && (
                          <Text style={styles.locationCoords}>
                            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                          </Text>
                        )}
                      </>
                    )}
                  </View>
                  <TouchableOpacity onPress={fetchLocation} style={styles.refreshLocBtn}>
                    <Text style={styles.refreshLocText}>↻</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.locationNote}>
                  {isReady ? '✅ Live GPS coordinates captured' : '⏳ Acquiring GPS signal...'}
                </Text>
              </View>

              {/* Notes */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>📝 Additional Notes (Optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Describe the situation — injuries, number of people, specific hazards..."
                  placeholderTextColor="#9CA3AF"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={300}
                />
                <Text style={styles.charCount}>{notes.length}/300</Text>
              </View>

              {/* Summary */}
              {selectedType && (
                <View style={[styles.summaryCard, { borderLeftColor: selectedTypeObj?.color }]}>
                  <Text style={styles.summaryTitle}>📋 Submission Summary</Text>
                  <Text style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>Type: </Text>
                    {selectedTypeObj?.icon} {selectedTypeObj?.label}
                  </Text>
                  <Text style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>Location: </Text>
                    {location.label}
                  </Text>
                  {notes.trim() ? (
                    <Text style={styles.summaryRow} numberOfLines={2}>
                      <Text style={styles.summaryKey}>Notes: </Text>
                      {notes.trim()}
                    </Text>
                  ) : null}
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, (!selectedType || loading || locLoading) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!selectedType || loading || locLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#DC2626', '#B91C1C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonIcon}>🆘</Text>
                      <Text style={styles.submitButtonText}>SUBMIT SOS ALERT</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.disclaimer}>
                ⚠️ Only use for real emergencies. False alerts may delay help for others.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#FEF2F2',
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 20,
    paddingBottom: 30,
  },

  // Back Button
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 4,
  },
  backIcon: {
    fontSize: 24,
    color: '#DC2626',
    fontWeight: '300',
    marginRight: 2,
  },
  backText: {
    fontSize: 15,
    color: '#DC2626',
    fontWeight: '500',
  },

  // Header
  headerContainer: {
    alignItems: 'center',
    marginBottom: isSmallDevice ? 20 : 24,
  },
  headerTitle: {
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  subtitleLine: {
    flex: 0.15,
    height: 2,
    backgroundColor: '#DC2626',
    borderRadius: 1,
  },
  subtitle: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#4B5563',
    fontWeight: '400',
    paddingHorizontal: 12,
    textAlign: 'center',
  },

  // Form Card
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: isSmallDevice ? 18 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  section: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },

  // Emergency Type Grid
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeCard: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  typeIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  typeLabel: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },

  // Location Card
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  locationIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationCity: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  locationCoords: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#6B7280',
    marginTop: 2,
  },
  refreshLocBtn: {
    padding: 8,
  },
  refreshLocText: {
    fontSize: 22,
    color: '#DC2626',
    fontWeight: '700',
  },
  locationNote: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#6B7280',
    marginTop: 6,
    paddingLeft: 4,
  },

  // Notes Input
  notesInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    fontSize: isSmallDevice ? 14 : 15,
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: isSmallDevice ? 11 : 12,
    color: '#9CA3AF',
    marginTop: 4,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    borderLeftWidth: 4,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  summaryTitle: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  summaryRow: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  summaryKey: {
    fontWeight: '600',
    color: '#1F2937',
  },

  // Submit Button
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitGradient: {
    padding: isSmallDevice ? 14 : 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isSmallDevice ? 48 : 56,
    flexDirection: 'row',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonIcon: {
    fontSize: 20,
    marginRight: 10,
    color: '#FFFFFF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Disclaimer
  disclaimer: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
});

export default SOSScreen;