// src/screens/SOSScreen.tsx
// Week 2 & 4 — SOS Home screen
// Week 2: type picker, notes, static location, submit → POST /api/emergency → ConfirmationScreen
// Week 4: real GPS via expo-location replaces mock location

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { emergencyService } from '../services/emergencyService';
import { colors, spacing, borderRadius, fontSizes, fontWeights, shadows } from '../styles/theme';

interface EmergencyType {
  key: string; label: string; icon: string; color: string; bgColor: string;
}

const EMERGENCY_TYPES: EmergencyType[] = [
  { key: 'medical',  label: 'Medical',  icon: '🚑', color: colors.danger,        bgColor: colors.dangerBg },
  { key: 'fire',     label: 'Fire',     icon: '🔥', color: colors.fire,          bgColor: colors.fireBg },
  { key: 'police',   label: 'Police',   icon: '👮', color: colors.police,        bgColor: colors.policeBg },
  { key: 'accident', label: 'Accident', icon: '🚗', color: colors.accident,      bgColor: colors.accidentBg },
  { key: 'other',    label: 'Other',    icon: '📞', color: colors.textSecondary, bgColor: colors.borderLight },
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
      // Reverse geocode for city label
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚨 Send SOS Alert</Text>
        <Text style={styles.headerSubtitle}>Fill details and submit — help is dispatched immediately</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Emergency Type Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select Emergency Type *</Text>
          <View style={styles.typeGrid}>
            {EMERGENCY_TYPES.map(type => {
              const isSel = selectedType === type.key;
              return (
                <TouchableOpacity
                  key={type.key}
                  style={[styles.typeCard, isSel && { backgroundColor: type.bgColor, borderColor: type.color, borderWidth: 2 }]}
                  onPress={() => setSelectedType(type.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text style={[styles.typeLabel, isSel && { color: type.color, fontWeight: fontWeights.bold }]}>{type.label}</Text>
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
                <ActivityIndicator size="small" color={colors.primary} />
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
            placeholderTextColor={colors.textPlaceholder}
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
            <Text style={styles.summaryRow}><Text style={styles.summaryKey}>Type: </Text>{selectedTypeObj?.icon} {selectedTypeObj?.label}</Text>
            <Text style={styles.summaryRow}><Text style={styles.summaryKey}>Location: </Text>{location.label}</Text>
            {notes.trim() ? <Text style={styles.summaryRow} numberOfLines={2}><Text style={styles.summaryKey}>Notes: </Text>{notes.trim()}</Text> : null}
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, (!selectedType || loading || locLoading) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!selectedType || loading || locLoading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.textWhite} size="small" />
          ) : (
            <>
              <Text style={styles.submitButtonIcon}>🆘</Text>
              <Text style={styles.submitButtonText}>SUBMIT SOS ALERT</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          ⚠️ Only use for real emergencies. False alerts may delay help for others.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: colors.background },
  header:               { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle:          { fontSize: fontSizes.xxl, fontWeight: fontWeights.bold, color: colors.textHeading },
  headerSubtitle:       { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: spacing.xs },
  scrollContent:        { padding: spacing.xl, paddingBottom: spacing.xxxl },
  section:              { marginBottom: spacing.xl },
  sectionLabel:         { fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.textHeading, marginBottom: spacing.md },
  typeGrid:             { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeCard:             { width: '47%', backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  typeIcon:             { fontSize: 28, marginBottom: spacing.sm },
  typeLabel:            { fontSize: fontSizes.md, fontWeight: fontWeights.medium, color: colors.textPrimary },
  selectedDot:          { width: 8, height: 8, borderRadius: borderRadius.full, marginTop: spacing.sm },
  locationCard:         { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  locationIcon:         { fontSize: 24, marginRight: spacing.md },
  locationTextContainer:{ flex: 1 },
  locationCity:         { fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.textPrimary },
  locationCoords:       { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  refreshLocBtn:        { padding: spacing.sm },
  refreshLocText:       { fontSize: 22, color: colors.primary, fontWeight: fontWeights.bold },
  locationNote:         { fontSize: fontSizes.xs, color: colors.textMuted, marginTop: spacing.sm, paddingLeft: spacing.xs },
  notesInput:           { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, padding: spacing.lg, fontSize: fontSizes.md, color: colors.textPrimary, minHeight: 100, ...shadows.sm },
  charCount:            { textAlign: 'right', fontSize: fontSizes.xs, color: colors.textMuted, marginTop: spacing.xs },
  summaryCard:          { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.xl, borderLeftWidth: 4, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  summaryTitle:         { fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.textHeading, marginBottom: spacing.sm },
  summaryRow:           { fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  summaryKey:           { fontWeight: fontWeights.semibold, color: colors.textPrimary },
  submitButton:         { backgroundColor: colors.danger, borderRadius: borderRadius.lg, paddingVertical: spacing.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', ...shadows.danger },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonIcon:     { fontSize: 20, marginRight: spacing.sm },
  submitButtonText:     { color: colors.textWhite, fontSize: fontSizes.lg, fontWeight: fontWeights.bold, letterSpacing: 0.5 },
  disclaimer:           { fontSize: fontSizes.xs, color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg, lineHeight: 16 },
});
