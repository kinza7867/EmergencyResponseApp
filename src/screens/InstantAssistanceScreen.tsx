// src/screens/InstantAssistanceScreen.tsx
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';

const LOGO = require('../../assets/logo.png');
const { width } = Dimensions.get('window');
const isSmallDevice = width < 380;

export const InstantAssistanceScreen = ({ navigation }: any) => {
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
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
  }, []);

  const emergencyServices = [
    {
      id: '1',
      title: 'Emergency Services',
      subtitle: 'General Dispatch Services',
      number: '911',
      color: '#DC2626',
      bgColor: '#FEF2F2',
    },
    {
      id: '2',
      title: 'Medical Emergency',
      subtitle: 'Critical Ambulance & Care',
      number: '1122',
      color: '#EF4444',
      bgColor: '#FEF2F2',
    },
    {
      id: '3',
      title: 'Fire Department',
      subtitle: 'Active Rescue Operations',
      number: '16',
      color: '#F97316',
      bgColor: '#FFF7ED',
    },
    {
      id: '4',
      title: 'Police Department',
      subtitle: 'Law Enforcement Dispatch',
      number: '15',
      color: '#3B82F6',
      bgColor: '#EFF6FF',
    },
  ];

  const quickContacts = [
    { name: 'Dr. Sarah Johnson', role: 'Primary Physician', phone: '+92-555-1234567' },
    { name: 'Emergency Contact', role: 'Next of Kin', phone: '+92-555-9876543' },
    { name: 'Poison Control', role: '24/7 National Helpline', phone: '1800-222-1222' },
  ];

  const handleEmergencyCall = (number: string, service: string) => {
    Vibration.vibrate([0, 100, 50, 100]);
    
    Alert.alert(
      `Call ${service}?`,
      `You are about to place a critical emergency call to ${number}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          style: 'destructive',
          onPress: () => {
            const phoneNumber = Platform.OS === 'android' ? `tel:${number}` : `telprompt:${number}`;
            Linking.openURL(phoneNumber).catch(() => {
              Alert.alert('Error', 'Unable to make call. Please dial manually.');
            });
          },
        },
      ]
    );
  };

  const handleContactCall = (phone: string) => {
    Vibration.vibrate(50);
    const phoneNumber = Platform.OS === 'android' ? `tel:${phone}` : `telprompt:${phone}`;
    Linking.openURL(phoneNumber).catch(() => {
      Alert.alert('Error', 'Unable to make call.');
    });
  };

  const handleLocationShare = async () => {
    Vibration.vibrate([0, 100, 50, 100]);
    setLoadingLocation(true);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required.');
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      
      Alert.alert(
        'Location Found',
        `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send Broadcast',
            style: 'destructive',
            onPress: async () => {
              const targetPhones = quickContacts.map(c => c.phone);
              const isAvailable = await SMS.isAvailableAsync();
              if (isAvailable) {
                await SMS.sendSMSAsync(
                  targetPhones,
                  `EMERGENCY: I need help!\nLocation: ${mapsUrl}`
                );
                Alert.alert('Sent!', 'Location sent to all contacts.');
              }
            }
          }
        ]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to get location.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const openMedicalResource = (type: 'firstaid' | 'kit') => {
    Vibration.vibrate(50);
    const targetUrl = type === 'firstaid'
      ? 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies/anatomy-of-a-first-aid-kit.html'
      : 'https://www.ready.gov/kit';
    Linking.openURL(targetUrl).catch(() => {
      Alert.alert('Error', 'Unable to open resource.');
    });
  };

  const goBack = () => {
    Vibration.vibrate(30);
    navigation.goBack();
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
            <Animated.View
              style={[
                styles.animatedContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={goBack}
                activeOpacity={0.7}
              >
                <Text style={styles.backIcon}>←</Text>
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>

              {/* Header */}
              <View style={styles.headerContainer}>
                <View style={styles.logoWrapper}>
                  <LinearGradient
                    colors={['#DC2626', '#991B1B']}
                    style={styles.logoGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Image
                      source={LOGO}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                  </LinearGradient>
                </View>
                <Text style={styles.title}>Emergency Assistance</Text>
                <View style={styles.subtitleContainer}>
                  <View style={styles.subtitleLine} />
                  <Text style={styles.subtitle}>Immediate help at your fingertips</Text>
                  <View style={styles.subtitleLine} />
                </View>
              </View>

              {/* Form Card */}
              <View style={styles.cardContainer}>
                {/* Emergency Warning */}
                <View style={styles.warningContainer}>
                  <View style={styles.warningIconContainer}>
                    <Text style={styles.warningIcon}>!</Text>
                  </View>
                  <Text style={styles.warningText}>
                    In life-threatening emergencies, call emergency services immediately.
                  </Text>
                </View>

                {/* Emergency Services */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Emergency Hotlines</Text>
                  {emergencyServices.map((service, index) => (
                    <Animated.View
                      key={service.id}
                      style={{
                        opacity: fadeAnim,
                        transform: [{ 
                          translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20 * (index + 1), 0],
                          })
                        }],
                      }}
                    >
                      <TouchableOpacity
                        style={[styles.serviceCard, { 
                          backgroundColor: service.bgColor, 
                          borderColor: service.color,
                          borderLeftWidth: 4,
                        }]}
                        onPress={() => handleEmergencyCall(service.number, service.title)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.serviceContent}>
                          <Text style={[styles.serviceTitle, { color: service.color }]}>
                            {service.title}
                          </Text>
                          <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
                        </View>
                        <View style={[styles.callButton, { backgroundColor: service.color }]}>
                          <Text style={styles.callButtonText}>Call</Text>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>

                {/* Quick Actions */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Quick Actions</Text>
                  <View style={styles.quickActionsRow}>
                    <TouchableOpacity 
                      style={styles.quickAction}
                      onPress={handleLocationShare}
                      disabled={loadingLocation}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={['#DC2626', '#B91C1C']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.quickActionGradient}
                      >
                        <View style={styles.quickActionIconContainer}>
                          <Text style={styles.quickActionIcon}>📍</Text>
                        </View>
                        <Text style={[styles.quickActionText, { color: '#FFFFFF' }]}>
                          {loadingLocation ? 'Locating...' : 'Share Location'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.quickAction}
                      onPress={() => openMedicalResource('firstaid')}
                      activeOpacity={0.7}
                    >
                      <View style={styles.quickActionWhite}>
                        <View style={styles.quickActionIconContainer}>
                          <Text style={styles.quickActionIcon}>🩹</Text>
                        </View>
                        <Text style={[styles.quickActionText, { color: '#4B5563' }]}>
                          First Aid
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.quickAction}
                      onPress={() => openMedicalResource('kit')}
                      activeOpacity={0.7}
                    >
                      <View style={styles.quickActionWhite}>
                        <View style={styles.quickActionIconContainer}>
                          <Text style={styles.quickActionIcon}>🎒</Text>
                        </View>
                        <Text style={[styles.quickActionText, { color: '#4B5563' }]}>
                          Supplies
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Emergency Contacts */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Emergency Contacts</Text>
                  {quickContacts.map((contact, index) => (
                    <Animated.View
                      key={index}
                      style={{
                        opacity: fadeAnim,
                        transform: [{ 
                          translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20 * (index + 1), 0],
                          })
                        }],
                      }}
                    >
                      <TouchableOpacity
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
                    </Animated.View>
                  ))}
                </View>

                {/* Safety Note */}
                <View style={styles.noteContainer}>
                  <Text style={styles.noteText}>
                    Emergency lines are available 24/7. Stay calm, state your location clearly.
                  </Text>
                </View>
              </View>
            </Animated.View>
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
  animatedContainer: {
    width: '100%',
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
  logoWrapper: {
    width: isSmallDevice ? 80 : 100,
    height: isSmallDevice ? 80 : 100,
    borderRadius: isSmallDevice ? 40 : 50,
    marginBottom: 12,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: isSmallDevice ? 40 : 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  logo: {
    width: '88%',
    height: '88%',
  },
  title: {
    fontSize: isSmallDevice ? 22 : 26,
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

  // Warning
  warningContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: '#DC2626',
  },
  warningIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  warningIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  warningText: {
    flex: 1,
    fontSize: isSmallDevice ? 12 : 13,
    color: '#1F2937',
    fontWeight: '500',
    lineHeight: 18,
  },

  // Sections
  sectionContainer: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    letterSpacing: 0.3,
  },

  // Service Cards
  serviceCard: {
    borderRadius: 12,
    padding: isSmallDevice ? 14 : 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceContent: {
    flex: 1,
    marginRight: 10,
  },
  serviceTitle: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '700',
  },
  serviceSubtitle: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#6B7280',
    marginTop: 2,
  },
  callButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: isSmallDevice ? 11 : 12,
  },

  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickAction: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickActionGradient: {
    paddingVertical: isSmallDevice ? 14 : 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionWhite: {
    backgroundColor: '#F9FAFB',
    paddingVertical: isSmallDevice ? 14 : 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIconContainer: {
    marginBottom: 4,
  },
  quickActionIcon: {
    fontSize: isSmallDevice ? 28 : 32,
  },
  quickActionText: {
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Contact Cards
  contactCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: isSmallDevice ? 14 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  contactRole: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#6B7280',
    marginTop: 2,
  },
  contactPhone: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#4B5563',
    fontWeight: '500',
    marginTop: 2,
  },
  contactCallIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },

  // Note
  noteContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  noteText: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#4B5563',
    lineHeight: 18,
    textAlign: 'center',
  },
});

export default InstantAssistanceScreen;