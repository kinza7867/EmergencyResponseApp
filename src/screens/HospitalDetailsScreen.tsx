// src/screens/HospitalDetailsScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  Vibration,
  Animated,
  StatusBar,
  Linking,
  Platform,
  ActivityIndicator,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';

const LOGO = require('../../assets/logo.png');
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 380;

interface HospitalDetails {
  id: string;
  name: string;
  address: string;
  distance: string;
  phone: string;
  rating: number;
  type: string;
  emergency: boolean;
  description: string;
  services: string[];
  facilities: string[];
  doctors: { name: string; specialty: string; available: boolean }[];
  timings: string;
  website?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
}

export const HospitalDetailsScreen = ({ route, navigation }: any) => {
  const { hospitalId } = route.params || {};
  const [hospital, setHospital] = useState<HospitalDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Animations
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

    getUserLocation();
    loadHospitalDetails();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      }
    } catch (error) {
      console.log('Location error:', error);
    }
  };

  const loadHospitalDetails = () => {
    // Mock hospital details data
    const mockHospital: HospitalDetails = {
      id: hospitalId || '1',
      name: 'City General Hospital',
      address: '123 Main Street, City Center, 54000',
      distance: '1.2 km',
      phone: '+92-42-1234567',
      rating: 4.8,
      type: 'General',
      emergency: true,
      description: 'City General Hospital is a leading healthcare facility providing comprehensive medical services with state-of-the-art equipment and experienced medical professionals available 24/7.',
      services: [
        'Emergency Care',
        'Surgery',
        'Cardiology',
        'Neurology',
        'Orthopedics',
        'Pediatrics',
        'Gynecology',
        'Intensive Care Unit',
        'Radiology',
        'Laboratory Services',
      ],
      facilities: [
        '24/7 Emergency Room',
        'Ambulance Service',
        'Pharmacy',
        'Cafeteria',
        'Parking',
        'Wheelchair Access',
        'ICU',
        'Operation Theaters',
        'Blood Bank',
        'Diagnostic Center',
      ],
      doctors: [
        { name: 'Dr. Ahmed Khan', specialty: 'Cardiologist', available: true },
        { name: 'Dr. Sarah Ali', specialty: 'Neurologist', available: true },
        { name: 'Dr. Muhammad Usman', specialty: 'Orthopedic Surgeon', available: false },
        { name: 'Dr. Fatima Noor', specialty: 'Pediatrician', available: true },
        { name: 'Dr. Omar Hassan', specialty: 'General Surgeon', available: true },
      ],
      timings: 'Open 24 hours, 7 days a week',
      website: 'www.citygeneralhospital.com',
      email: 'info@citygeneralhospital.com',
    };

    setHospital(mockHospital);
    setLoading(false);
  };

  const handleCall = (phone: string) => {
    Vibration.vibrate(30);
    const phoneNumber = Platform.OS === 'android' ? `tel:${phone}` : `telprompt:${phone}`;
    Linking.openURL(phoneNumber).catch(() => {
      Alert.alert('Error', 'Unable to make call. Please dial manually.');
    });
  };

  const handleNavigate = () => {
    Vibration.vibrate(30);
    if (hospital) {
      const url = Platform.OS === 'ios'
        ? `http://maps.apple.com/?q=${hospital.name}`
        : `https://www.google.com/maps/search/?api=1&query=${hospital.name}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Unable to open maps.');
      });
    }
  };

  const handleShare = async () => {
    Vibration.vibrate(20);
    if (hospital) {
      try {
        await Share.share({
          message: `🏥 ${hospital.name}\n📍 ${hospital.address}\n📞 ${hospital.phone}\n⭐ ${hospital.rating}/5.0\n\nShared via Emergency Response App`,
        });
      } catch (error) {
        Alert.alert('Error', 'Unable to share.');
      }
    }
  };

  const handleWebsite = (url: string) => {
    Vibration.vibrate(20);
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(fullUrl).catch(() => {
      Alert.alert('Error', 'Unable to open website.');
    });
  };

  const handleEmail = (email: string) => {
    Vibration.vibrate(20);
    Linking.openURL(`mailto:${email}`).catch(() => {
      Alert.alert('Error', 'Unable to open email.');
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={`star-${i}`} name="star" size={16} color="#F59E0B" />);
    }
    if (hasHalfStar) {
      stars.push(<Ionicons key="half-star" name="star-half" size={16} color="#F59E0B" />);
    }
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Ionicons key={`empty-star-${i}`} name="star-outline" size={16} color="#D1D5DB" />);
    }
    return stars;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>Loading hospital details...</Text>
      </View>
    );
  }

  if (!hospital) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
        <Ionicons name="alert-circle" size={64} color="#DC2626" />
        <Text style={styles.errorText}>Hospital not found</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />

      {/* Header */}
      <LinearGradient
        colors={['#DC2626', '#991B1B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image source={LOGO} style={styles.headerLogo} resizeMode="contain" />
            <Text style={styles.headerTitle}>Hospital Details</Text>
          </View>

          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.7}
            style={styles.shareButton}
          >
            <Ionicons name="share" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

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
          {/* Hospital Header Card */}
          <View style={styles.hospitalHeaderCard}>
            <View style={styles.hospitalHeaderTop}>
              <View style={styles.hospitalIconContainer}>
                <Ionicons name="business" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.hospitalHeaderInfo}>
                <Text style={styles.hospitalName}>{hospital.name}</Text>
                <View style={styles.hospitalRatingContainer}>
                  {renderStars(hospital.rating)}
                  <Text style={styles.hospitalRatingText}>{hospital.rating}</Text>
                </View>
              </View>
              {hospital.emergency && (
                <View style={styles.emergencyBadge}>
                  <Text style={styles.emergencyBadgeText}>EMERGENCY</Text>
                </View>
              )}
            </View>

            <View style={styles.hospitalHeaderDivider} />

            <View style={styles.hospitalHeaderDetails}>
              <View style={styles.hospitalHeaderDetailItem}>
                <Ionicons name="location" size={18} color="#6B7280" />
                <Text style={styles.hospitalHeaderDetailText}>{hospital.distance} away</Text>
              </View>
              <View style={styles.hospitalHeaderDetailItem}>
                <Ionicons name="time" size={18} color="#6B7280" />
                <Text style={styles.hospitalHeaderDetailText}>Open 24/7</Text>
              </View>
              <View style={styles.hospitalHeaderDetailItem}>
                <Ionicons name="medical" size={18} color="#6B7280" />
                <Text style={styles.hospitalHeaderDetailText}>{hospital.type}</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={[styles.quickAction, styles.callAction]}
              onPress={() => handleCall(hospital.phone)}
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={24} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAction, styles.navigateAction]}
              onPress={handleNavigate}
              activeOpacity={0.7}
            >
              <Ionicons name="navigate" size={24} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Navigate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAction, styles.shareAction]}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Ionicons name="share" size={24} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.descriptionText}>{hospital.description}</Text>
          </View>

          {/* Address & Contact */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Address & Contact</Text>
            <View style={styles.contactItem}>
              <Ionicons name="location" size={20} color="#DC2626" />
              <Text style={styles.contactText}>{hospital.address}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={20} color="#DC2626" />
              <TouchableOpacity onPress={() => handleCall(hospital.phone)} activeOpacity={0.7}>
                <Text style={[styles.contactText, styles.contactLink]}>{hospital.phone}</Text>
              </TouchableOpacity>
            </View>
            {hospital.email && (
              <View style={styles.contactItem}>
                <Ionicons name="mail" size={20} color="#DC2626" />
                <TouchableOpacity onPress={() => handleEmail(hospital.email!)} activeOpacity={0.7}>
                  <Text style={[styles.contactText, styles.contactLink]}>{hospital.email}</Text>
                </TouchableOpacity>
              </View>
            )}
            {hospital.website && (
              <View style={styles.contactItem}>
                <Ionicons name="globe" size={20} color="#DC2626" />
                <TouchableOpacity onPress={() => handleWebsite(hospital.website!)} activeOpacity={0.7}>
                  <Text style={[styles.contactText, styles.contactLink]}>{hospital.website}</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.contactItem}>
              <Ionicons name="time" size={20} color="#DC2626" />
              <Text style={styles.contactText}>{hospital.timings}</Text>
            </View>
          </View>

          {/* Services */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.servicesGrid}>
              {hospital.services.map((service, index) => (
                <View key={index} style={styles.serviceTag}>
                  <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                  <Text style={styles.serviceTagText}>{service}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Facilities */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Facilities</Text>
            <View style={styles.facilitiesGrid}>
              {hospital.facilities.map((facility, index) => (
                <View key={index} style={styles.facilityTag}>
                  <Ionicons name="checkmark" size={14} color="#DC2626" />
                  <Text style={styles.facilityTagText}>{facility}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Doctors */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Available Doctors</Text>
            {hospital.doctors.map((doctor, index) => (
              <View key={index} style={styles.doctorCard}>
                <View style={styles.doctorInfo}>
                  <View style={styles.doctorAvatar}>
                    <Text style={styles.doctorAvatarText}>
                      {doctor.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={styles.doctorDetails}>
                    <Text style={styles.doctorName}>{doctor.name}</Text>
                    <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                  </View>
                </View>
                <View style={[styles.doctorStatus, doctor.available ? styles.doctorAvailable : styles.doctorUnavailable]}>
                  <Text style={styles.doctorStatusText}>
                    {doctor.available ? 'Available' : 'Busy'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Emergency Info */}
          {hospital.emergency && (
            <View style={styles.emergencyInfoCard}>
              <View style={styles.emergencyInfoHeader}>
                <Ionicons name="alert-circle" size={24} color="#DC2626" />
                <Text style={styles.emergencyInfoTitle}>Emergency Services Available</Text>
              </View>
              <Text style={styles.emergencyInfoText}>
                This hospital provides 24/7 emergency services. In case of emergency, call immediately or visit the emergency room.
              </Text>
              <TouchableOpacity
                style={styles.emergencyCallButton}
                onPress={() => handleCall(hospital.phone)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#DC2626', '#B91C1C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.emergencyCallGradient}
                >
                  <Ionicons name="call" size={20} color="#FFFFFF" />
                  <Text style={styles.emergencyCallButtonText}>Emergency Call</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
  },
  errorButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  backButton: {
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
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  contentContainer: {
    paddingTop: 16,
  },

  // Hospital Header Card
  hospitalHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  hospitalHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hospitalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  hospitalHeaderInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  hospitalRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  hospitalRatingText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },
  emergencyBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  emergencyBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#DC2626',
  },
  hospitalHeaderDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  hospitalHeaderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  hospitalHeaderDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hospitalHeaderDetailText: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#6B7280',
  },

  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  callAction: {
    backgroundColor: '#DC2626',
  },
  navigateAction: {
    backgroundColor: '#3B82F6',
  },
  shareAction: {
    backgroundColor: '#8B5CF6',
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
  },

  // Section Cards
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },

  // Description
  descriptionText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#4B5563',
    lineHeight: 22,
  },

  // Contact
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  contactText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#4B5563',
    flex: 1,
  },
  contactLink: {
    color: '#DC2626',
    textDecorationLine: 'underline',
  },

  // Services
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  serviceTagText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#065F46',
    fontWeight: '500',
  },

  // Facilities
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  facilityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  facilityTagText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#DC2626',
    fontWeight: '500',
  },

  // Doctors
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  doctorSpecialty: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#6B7280',
  },
  doctorStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  doctorAvailable: {
    backgroundColor: '#F0FDF4',
  },
  doctorUnavailable: {
    backgroundColor: '#FEF2F2',
  },
  doctorStatusText: {
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '600',
    color: '#065F46',
  },

  // Emergency Info
  emergencyInfoCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 8,
  },
  emergencyInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  emergencyInfoTitle: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '700',
    color: '#DC2626',
  },
  emergencyInfoText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  emergencyCallButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emergencyCallGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  emergencyCallButtonText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '700',
  },
});

export default HospitalDetailsScreen;