// src/screens/InstantAssistanceScreen.tsx
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Linking,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 380;

export const InstantAssistanceScreen = ({ navigation }: any) => {
  const [loadingLocation, setLoadingLocation] = useState(false);

  const emergencyServices = [
    {
      id: '1',
      title: '🚨 Emergency Services',
      subtitle: 'General Dispatch Services',
      number: '911',
      color: '#DC2626',
    },
    {
      id: '2',
      title: '🚑 Medical Emergency',
      subtitle: 'Critical Ambulance & Care',
      number: '911',
      color: '#EF4444',
    },
    {
      id: '3',
      title: '🚒 Fire Department',
      subtitle: 'Active Rescue Operations',
      number: '911',
      color: '#F59E0B',
    },
    {
      id: '4',
      title: '🚓 Police Department',
      subtitle: 'Law Enforcement Dispatch',
      number: '911',
      color: '#3B82F6',
    },
  ];

  const quickContacts = [
    { name: 'Dr. Sarah Johnson', role: 'Primary Physician', phone: '+15551234567' },
    { name: 'Emergency Contact', role: 'Next of Kin', phone: '+15559876543' },
    { name: 'Poison Control', role: '24/7 National Helpline', phone: '18002221222' },
  ];

  const handleEmergencyCall = (number: string, service: string) => {
    Alert.alert(
      `Call ${service}?`,
      `You are about to place a critical call to ${number}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          style: 'destructive',
          onPress: () => {
            const phoneNumber = Platform.OS === 'android' ? `tel:${number}` : `telprompt:${number}`;
            Linking.openURL(phoneNumber).catch(() => {
              Alert.alert('System Error', 'Unable to execute native dialer. Please dial 911 directly.');
            });
          },
        },
      ]
    );
  };

  const handleContactCall = (phone: string) => {
    const phoneNumber = Platform.OS === 'android' ? `tel:${phone}` : `telprompt:${phone}`;
    Linking.openURL(phoneNumber).catch(() => {
      Alert.alert('Error', 'Unable to connect call. Please check device configuration.');
    });
  };

  const handleLocationShare = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required to parse exact emergency data.');
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      
      Alert.alert(
        'Coordinates Found',
        `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}\n\nWould you like to broadcast this data to your emergency contacts?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send Broadcast',
            onPress: async () => {
              const targetPhones = quickContacts.map(c => c.phone);
              const isAvailable = await SMS.isAvailableAsync();
              if (isAvailable) {
                await SMS.sendSMSAsync(
                  targetPhones,
                  `EMERGENCY BROADCAST: I need immediate assistance! Here is my exact live location map layout: ${mapsUrl}`
                );
              } else {
                // Fallback direct URL schema pattern if custom framework fails
                const fallbackSms = `sms:${targetPhones.join(',')}?body=Emergency! Location: ${mapsUrl}`;
                Linking.openURL(fallbackSms);
              }
            }
          }
        ]
      );
    } catch (err) {
      Alert.alert('Hardware Exception', 'Failed to pull accurate GPS variables.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const openMedicalResource = (type: 'firstaid' | 'kit') => {
    const targetUrl = type === 'firstaid'
      ? 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies/anatomy-of-a-first-aid-kit.html'
      : 'https://www.ready.gov/kit';

    Linking.canOpenURL(targetUrl).then((supported) => {
      if (supported) {
        Linking.openURL(targetUrl);
      } else {
        Alert.alert('Error', 'Unable to display reference guidelines.');
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
      <LinearGradient
        colors={['#dbabab', '#b65d5d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Go back"
            >
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Instant Assistance</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Emergency Warning Banner */}
          <View style={styles.warningContainer}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              In severe or life-threatening crises, bypass apps and contact emergency services instantly.
            </Text>
          </View>

          {/* Emergency Dispatch System */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Emergency Hotlines</Text>
            <View style={styles.servicesGrid}>
              {emergencyServices.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceCard}
                  onPress={() => handleEmergencyCall(service.number, service.title)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[service.color, service.color + 'CC']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.serviceGradient}
                  >
                    <View style={styles.serviceMetaContent}>
                      <Text style={styles.serviceTitle}>{service.title}</Text>
                      <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
                    </View>
                    <View style={styles.callButton}>
                      <Text style={styles.callButtonText}>📞 Call {service.number}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Hardware & Informational Quick Actions */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Quick Hardware Actions</Text>
            <View style={styles.quickActionsRow}>
              <TouchableOpacity 
                style={styles.quickAction} 
                onPress={handleLocationShare}
                disabled={loadingLocation}
              >
                <Text style={styles.quickActionIcon}>📍</Text>
                <Text style={styles.quickActionText}>
                  {loadingLocation ? 'Locating...' : 'Share Location'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickAction} onPress={() => openMedicalResource('firstaid')}>
                <Text style={styles.quickActionIcon}>🩹</Text>
                <Text style={styles.quickActionText}>First Aid Hub</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickAction} onPress={() => openMedicalResource('kit')}>
                <Text style={styles.quickActionIcon}>🎒</Text>
                <Text style={styles.quickActionText}>Supplies Kit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Core Emergency Network Contacts */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Primary Emergency Network</Text>
            {quickContacts.map((contact, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactCard}
                onPress={() => handleContactCall(contact.phone)}
                activeOpacity={0.7}
              >
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactRole}>{contact.role}</Text>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                </View>
                <View style={styles.contactCallIcon}>
                  <Text style={styles.phoneIcon}>📞</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Operational Safety Note */}
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              💡 Dispatch lines are online 24/7. Maintain composure, state your operational vector clearly, and do not disconnect until instructed.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#DC2626',
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: isSmallDevice ? 16 : 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 38,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 44,
  },
  warningContainer: {
    backgroundColor: 'rgba(220, 38, 38, 0.4)',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#DC2626',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningText: {
    flex: 1,
    fontSize: isSmallDevice ? 13 : 14,
    color: '#FFFFFF',
    fontWeight: '600',
    lineHeight: 18,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  servicesGrid: {
    gap: 12,
  },
  serviceCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 4,
  },
  serviceGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isSmallDevice ? 14 : 16,
  },
  serviceMetaContent: {
    flex: 1,
    marginRight: 8,
  },
  serviceTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  serviceSubtitle: {
    fontSize: isSmallDevice ? 12 : 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  callButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  callButtonText: {
    color: '#1F2937',
    fontWeight: '700',
    fontSize: isSmallDevice ? 12 : 13,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickAction: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: isSmallDevice ? 12 : 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  quickActionIcon: {
    fontSize: isSmallDevice ? 26 : 30,
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  contactCard: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 12,
    padding: isSmallDevice ? 14 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contactRole: {
    fontSize: isSmallDevice ? 11 : 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  contactPhone: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#FFFFFF',
    fontWeight: '500',
    marginTop: 4,
  },
  contactCallIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneIcon: {
    fontSize: 18,
  },
  noteContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 30,
    marginTop: 10,
  },
  noteText: {
    fontSize: isSmallDevice ? 12 : 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
});