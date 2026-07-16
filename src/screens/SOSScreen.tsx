// src/screens/SOSScreen.tsx
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { createEmergencyRequest } from "../services/emergencyService";

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 380;
const isTablet = width >= 768;

interface EmergencyType {
  key: string;
  label: string;
  icon: string;
  iconSet: 'ionicons' | 'fontawesome5' | 'material';
  color: string;
  bgColor: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
}

const EMERGENCY_TYPES: EmergencyType[] = [
  {
    key: 'medical',
    label: 'Medical',
    icon: 'medical',
    iconSet: 'ionicons',
    color: '#DC2626',
    bgColor: '#FEF2F2',
    description: 'Medical emergency',
    urgency: 'high'
  },
  {
    key: 'fire',
    label: 'Fire',
    icon: 'flame',
    iconSet: 'ionicons',
    color: '#F97316',
    bgColor: '#FFF7ED',
    description: 'Fire emergency',
    urgency: 'high'
  },
  {
    key: 'police',
    label: 'Police',
    icon: 'shield',
    iconSet: 'ionicons',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    description: 'Police emergency',
    urgency: 'high'
  },
  {
    key: 'accident',
    label: 'Accident',
    icon: 'car',
    iconSet: 'ionicons',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    description: 'Traffic accident',
    urgency: 'medium'
  },
  {
    key: 'rescue',
    label: 'Rescue',
    icon: 'life-ring',
    iconSet: 'fontawesome5',
    color: '#EC4899',
    bgColor: '#FDF2F8',
    description: 'Emergency rescue',
    urgency: 'high'
  },
  {
    key: 'other',
    label: 'Other',
    icon: 'alert-circle',
    iconSet: 'ionicons',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    description: 'Other emergency',
    urgency: 'low'
  },
];

export const SOSScreen = ({ navigation }: any) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [locLoading, setLocLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [location, setLocation] = useState<{
    label: string;
    latitude: number;
    longitude: number;
  }>({ label: 'Fetching location...', latitude: 0, longitude: 0 });
  const [isLocationReady, setIsLocationReady] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      try {
        const raw = await AsyncStorage.getItem('userData');
        if (raw) {
          const user = JSON.parse(raw);
          setUserId(user.id || 'user-1');
          setUserName(user.name || 'User');
        }
      } catch {
        setUserId('user-1');
        setUserName('User');
      }
      await fetchLocation();
    };
    init();
  }, []);

  const fetchLocation = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation({
          label: 'Location permission denied',
          latitude: 0,
          longitude: 0,
        });
        setIsLocationReady(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = pos.coords;
      const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
      const g = geo[0];
      const label =
        [g?.city, g?.region, g?.country].filter(Boolean).join(', ') ||
        'Current Location';
      setLocation({ label, latitude, longitude });
      setIsLocationReady(true);
    } catch {
      setLocation({
        label: 'Unable to get location',
        latitude: 0,
        longitude: 0,
      });
      setIsLocationReady(false);
    } finally {
      setLocLoading(false);
    }
  };

  const handleEmergencyCall = () => {
    Vibration.vibrate(50);
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

  const validateForm = () => {
    if (!selectedType) {
      Alert.alert(
        'Select Emergency Type',
        'Please choose the type of emergency before submitting.'
      );
      return false;
    }
    if (!isLocationReady && !locLoading) {
      Alert.alert(
        'Location Required',
        'Unable to get location. Please tap refresh to try again.'
      );
      return false;
    }
    return true;
  };

 const handleSubmit = async () => {

   //console.log("Submit button pressed");
  if (!validateForm()) return;

  setLoading(true);

  try {
   const response = await createEmergencyRequest({
  emergencyType: selectedType,
  notes: notes.trim(),
  location,
});

console.log("API RESPONSE =", JSON.stringify(response, null, 2));
    if (response.success) {
      navigation.navigate("Confirmation", {
        request: response.data,
      });

      setSelectedType("");
      setNotes("");
    }
  } catch (error: any) {
    console.log(error.response?.data || error);

    Alert.alert(
      "Submission Failed",
      error.response?.data?.message ||
      error.message ||
      "Could not submit emergency request."
    );
  } finally {
    setLoading(false);
  }
};

  const selectedTypeObj = EMERGENCY_TYPES.find((t) => t.key === selectedType);

  const renderTypeIcon = (type: EmergencyType) => {
    const size = isSmallDevice ? 24 : 28;
    const color = selectedType === type.key ? type.color : '#6B7280';
    
    if (type.iconSet === 'fontawesome5') {
      return <FontAwesome5 name={type.icon as any} size={size} color={color} />;
    } else if (type.iconSet === 'material') {
      return <MaterialIcons name={type.icon as any} size={size} color={color} />;
    }
    return <Ionicons name={type.icon as any} size={size} color={color} />;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#DC2626';
      case 'medium': return '#F59E0B';
      case 'low': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getUrgencyBgColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#FEF2F2';
      case 'medium': return '#FFFBEB';
      case 'low': return '#F3F4F6';
      default: return '#F3F4F6';
    }
  };

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
              <Ionicons name="arrow-back" size={24} color="#DC2626" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.headerContainer}>
              <View style={styles.headerIconContainer}>
                <LinearGradient
                  colors={['#DC2626', '#991B1B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.headerIconGradient}
                >
                  <Ionicons name="alert-circle" size={36} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={styles.headerTitle}>SOS Emergency Alert</Text>
              <View style={styles.subtitleContainer}>
                <View style={styles.subtitleLine} />
                <Text style={styles.subtitle}>Help is dispatched immediately</Text>
                <View style={styles.subtitleLine} />
              </View>
            </View>

            {/* Quick Emergency Call */}
            <TouchableOpacity
              style={styles.quickCallButton}
              onPress={handleEmergencyCall}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#DC2626', '#B91C1C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.quickCallGradient}
              >
                <Ionicons name="call" size={24} color="#FFFFFF" />
                <View style={styles.quickCallTextContainer}>
                  <Text style={styles.quickCallText}>Emergency Call</Text>
                  <Text style={styles.quickCallSubtext}>1122 • 15 • 16</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Form Card */}
            <View style={styles.cardContainer}>
              {/* Emergency Type Picker */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                  Select Emergency Type
                  <Text style={styles.requiredStar}> *</Text>
                </Text>
                <View style={styles.typeGrid}>
                  {EMERGENCY_TYPES.map((type) => {
                    const isSel = selectedType === type.key;
                    return (
                      <TouchableOpacity
                        key={type.key}
                        style={[
                          styles.typeCard,
                          isSel && {
                            backgroundColor: type.bgColor,
                            borderColor: type.color,
                            borderWidth: 2,
                            shadowColor: type.color,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 4,
                            elevation: 2,
                          },
                        ]}
                        onPress={() => setSelectedType(type.key)}
                        activeOpacity={0.7}
                      >
                        <View style={[
                          styles.typeIconWrapper,
                          isSel && { backgroundColor: type.color + '20' }
                        ]}>
                          {renderTypeIcon(type)}
                        </View>
                        <Text
                          style={[
                            styles.typeLabel,
                            isSel && { color: type.color, fontWeight: '700' },
                          ]}
                        >
                          {type.label}
                        </Text>
                        {isSel && (
                          <View style={[styles.selectedDot, { backgroundColor: type.color }]} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Live GPS Location */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                  Current Location
                </Text>
                <View style={styles.locationCard}>
                  <View style={styles.locationIconContainer}>
                    <Ionicons name="location" size={22} color={isLocationReady ? '#22C55E' : '#6B7280'} />
                  </View>
                  <View style={styles.locationTextContainer}>
                    {locLoading ? (
                      <ActivityIndicator size="small" color="#DC2626" />
                    ) : (
                      <>
                        <Text style={styles.locationCity} numberOfLines={1}>
                          {location.label}
                        </Text>
                        {isLocationReady && location.latitude !== 0 && (
                          <Text style={styles.locationCoords}>
                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                          </Text>
                        )}
                      </>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={fetchLocation}
                    style={styles.refreshLocBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="refresh" size={22} color="#DC2626" />
                  </TouchableOpacity>
                </View>
                <View style={styles.locationStatusContainer}>
                  <View style={[styles.locationDot, isLocationReady && styles.locationDotActive]} />
                  <Text style={[styles.locationNote, isLocationReady && styles.locationReady]}>
                    {isLocationReady
                      ? 'Live GPS coordinates captured'
                      : locLoading ? 'Acquiring GPS signal...' : 'Location not available'}
                  </Text>
                </View>
              </View>

              {/* Notes */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                  Additional Notes
                  <Text style={styles.optionalText}> (Optional)</Text>
                </Text>
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
                <View
                  style={[
                    styles.summaryCard,
                    { borderLeftColor: selectedTypeObj?.color },
                  ]}
                >
                  <Text style={styles.summaryTitle}>
                    Submission Summary
                  </Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>Type</Text>
                    <Text style={styles.summaryValue}>
                      {selectedTypeObj?.label}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>Location</Text>
                    <Text style={styles.summaryValue} numberOfLines={1}>
                      {location.label}
                    </Text>
                  </View>
                  {notes.trim() ? (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryKey}>Notes</Text>
                      <Text style={styles.summaryValue} numberOfLines={2}>
                        {notes.trim()}
                      </Text>
                    </View>
                  ) : null}
                  <View style={styles.summaryUrgency}>
                    <Text style={styles.summaryKey}>Urgency</Text>
                    <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyBgColor(selectedTypeObj?.urgency || 'low') }]}>
                      <Text style={[styles.urgencyText, { color: getUrgencyColor(selectedTypeObj?.urgency || 'low') }]}>
                        {selectedTypeObj?.urgency.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!selectedType || loading || locLoading || !isLocationReady) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!selectedType || loading || locLoading || !isLocationReady}
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
                      <Ionicons name="alert-circle" size={22} color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>SUBMIT SOS ALERT</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.disclaimer}>
                Only use for real emergencies. False alerts may delay help for others.
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
    paddingHorizontal: isSmallDevice ? 14 : 20,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 20,
    paddingBottom: 30,
  },

  // Back Button
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 2,
  },
  backText: {
    fontSize: 15,
    color: '#DC2626',
    fontWeight: '500',
    marginLeft: 4,
  },

  // Header
  headerContainer: {
    alignItems: 'center',
    marginBottom: isSmallDevice ? 14 : 18,
  },
  headerIconContainer: {
    width: isSmallDevice ? 56 : 64,
    height: isSmallDevice ? 56 : 64,
    borderRadius: isSmallDevice ? 28 : 32,
    marginBottom: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  headerIconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: isSmallDevice ? 28 : 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  subtitleLine: {
    flex: 0.12,
    height: 2,
    backgroundColor: '#DC2626',
    borderRadius: 1,
  },
  subtitle: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#4B5563',
    fontWeight: '400',
    paddingHorizontal: 10,
    textAlign: 'center',
  },

  // Quick Call
  quickCallButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  quickCallGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  quickCallTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  quickCallText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: '700',
  },
  quickCallSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '400',
    marginTop: 1,
  },

  // Form Card
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: isSmallDevice ? 16 : 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#DC2626',
    fontWeight: '700',
  },
  optionalText: {
    fontWeight: '400',
    color: '#9CA3AF',
  },

  // Emergency Type Grid
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeCard: {
    width: '31%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: isSmallDevice ? 10 : 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  typeIconWrapper: {
    width: isSmallDevice ? 36 : 40,
    height: isSmallDevice ? 36 : 40,
    borderRadius: isSmallDevice ? 18 : 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  selectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 3,
  },

  // Location Card
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationCity: {
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  locationCoords: {
    fontSize: isSmallDevice ? 9 : 10,
    color: '#6B7280',
    marginTop: 1,
  },
  refreshLocBtn: {
    padding: 8,
  },
  locationStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingLeft: 4,
  },
  locationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    marginRight: 6,
  },
  locationDotActive: {
    backgroundColor: '#22C55E',
  },
  locationNote: {
    fontSize: isSmallDevice ? 9 : 10,
    color: '#6B7280',
  },
  locationReady: {
    color: '#22C55E',
    fontWeight: '600',
  },

  // Notes Input
  notesInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: isSmallDevice ? 12 : 13,
    color: '#1F2937',
    minHeight: 90,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: isSmallDevice ? 9 : 10,
    color: '#9CA3AF',
    marginTop: 3,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  summaryTitle: {
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingVertical: 2,
    alignItems: 'center',
  },
  summaryKey: {
    fontSize: isSmallDevice ? 11 : 12,
    fontWeight: '600',
    color: '#1F2937',
    width: 70,
  },
  summaryValue: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#4B5563',
    flex: 1,
  },
  summaryUrgency: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 3,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  urgencyText: {
    fontSize: isSmallDevice ? 9 : 10,
    fontWeight: '700',
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
    minHeight: isSmallDevice ? 48 : 54,
    flexDirection: 'row',
    gap: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 12 : 14,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Disclaimer
  disclaimer: {
    fontSize: isSmallDevice ? 9 : 10,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 15,
  },
});

export default SOSScreen;