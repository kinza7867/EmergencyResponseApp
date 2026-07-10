// src/screens/EditProfileScreen.tsx
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
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';

const LOGO = require('../../assets/logo.png');
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 380;

// Extend User type locally
interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  bloodGroup?: string;
  allergies?: string;
  medicalConditions?: string;
  medications?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  emergencyRelationship?: string;
  photo?: string;
}

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  bloodGroup: string;
  allergies: string;
  medicalConditions: string;
  medications: string;
  emergencyContact: string;
  emergencyPhone: string;
  emergencyRelationship: string;
}

export const EditProfileScreen = ({ navigation }: any) => {
  const { user, updateUser } = useAuth();
  const extendedUser = user as ExtendedUser | null;
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: extendedUser?.name || '',
    email: extendedUser?.email || '',
    phone: extendedUser?.phone || '',
    address: extendedUser?.address || '',
    bloodGroup: extendedUser?.bloodGroup || '',
    allergies: extendedUser?.allergies || '',
    medicalConditions: extendedUser?.medicalConditions || '',
    medications: extendedUser?.medications || '',
    emergencyContact: extendedUser?.emergencyContact || '',
    emergencyPhone: extendedUser?.emergencyPhone || '',
    emergencyRelationship: extendedUser?.emergencyRelationship || '',
  });

  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(extendedUser?.photo || null);
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});
  const [isEditing, setIsEditing] = useState(false);

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

    requestPermissions();
    loadUserData();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access media library denied');
      }
    } catch (error) {
      console.log('Error requesting permissions:', error);
    }
  };

  const loadUserData = async () => {
    try {
      const saved = await AsyncStorage.getItem('userProfile');
      if (saved) {
        const profile = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...profile }));
        if (profile.photo) setSelectedImage(profile.photo);
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-() ]{7,20}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (formData.emergencyPhone && !/^[0-9+\-() ]{7,20}$/.test(formData.emergencyPhone)) {
      newErrors.emergencyPhone = 'Please enter a valid emergency phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Vibration.vibrate(50);
      Alert.alert('Error', 'Please fix the errors before saving.');
      return;
    }

    setLoading(true);
    Vibration.vibrate(20);

    try {
      const profileData = {
        ...formData,
        photo: selectedImage,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
      
      if (updateUser) {
        await updateUser(profileData);
      }

      setIsEditing(false);
      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      // For SDK 54 - Use MediaTypeOptions.Images
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        Vibration.vibrate(20);
      }
    } catch (error) {
      console.log('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your camera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        Vibration.vibrate(20);
      }
    } catch (error) {
      console.log('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Update Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Gallery', onPress: handlePickImage },
        ...(selectedImage ? [{ 
          text: 'Remove Photo', 
          style: 'destructive' as const,
          onPress: () => {
            setSelectedImage(null);
            Vibration.vibrate(20);
          }
        }] : []),
        { text: 'Cancel', style: 'cancel' as const },
      ]
    );
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getRandomColor = (name: string) => {
    const colors = ['#DC2626', '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

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
            <Text style={styles.headerTitle}>Edit Profile</Text>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.7}
            style={styles.saveButton}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
            {/* Profile Image */}
            <View style={styles.imageSection}>
              <TouchableOpacity
                style={styles.imageContainer}
                onPress={showImageOptions}
                activeOpacity={0.8}
              >
                {selectedImage ? (
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={[styles.placeholderImage, { backgroundColor: getRandomColor(formData.name || 'U') }]}>
                    <Text style={styles.placeholderText}>
                      {getInitials(formData.name)}
                    </Text>
                  </View>
                )}
                <View style={styles.cameraIconContainer}>
                  <Ionicons name="camera" size={18} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <Text style={styles.imageHint}>Tap to change photo</Text>
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
              {/* Personal Information */}
              <Text style={styles.sectionTitle}>Personal Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                  <Ionicons name="person" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor="#9CA3AF"
                    value={formData.name}
                    onChangeText={(text) => {
                      setFormData({ ...formData, name: text });
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    returnKeyType="next"
                    maxLength={50}
                  />
                </View>
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                  <Ionicons name="mail" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    value={formData.email}
                    onChangeText={(text) => {
                      setFormData({ ...formData, email: text });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    maxLength={100}
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputWrapper, errors.phone && styles.inputError]}>
                  <Ionicons name="call" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="+92-300-1234567"
                    placeholderTextColor="#9CA3AF"
                    value={formData.phone}
                    onChangeText={(text) => {
                      setFormData({ ...formData, phone: text });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                    maxLength={20}
                  />
                </View>
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address</Text>
                <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                  <Ionicons name="location" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Enter your address"
                    placeholderTextColor="#9CA3AF"
                    value={formData.address}
                    onChangeText={(text) => setFormData({ ...formData, address: text })}
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                    maxLength={200}
                  />
                </View>
              </View>

              {/* Medical Information */}
              <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>Medical Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Blood Group</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="heart" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., A+, B-, O+"
                    placeholderTextColor="#9CA3AF"
                    value={formData.bloodGroup}
                    onChangeText={(text) => setFormData({ ...formData, bloodGroup: text })}
                    returnKeyType="next"
                    maxLength={5}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Allergies</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="alert-circle" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Penicillin, Latex, Pollen"
                    placeholderTextColor="#9CA3AF"
                    value={formData.allergies}
                    onChangeText={(text) => setFormData({ ...formData, allergies: text })}
                    returnKeyType="next"
                    maxLength={100}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Medical Conditions</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="medical" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Asthma, Diabetes, Hypertension"
                    placeholderTextColor="#9CA3AF"
                    value={formData.medicalConditions}
                    onChangeText={(text) => setFormData({ ...formData, medicalConditions: text })}
                    returnKeyType="next"
                    maxLength={100}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Medications</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="medkit" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Insulin, Salbutamol"
                    placeholderTextColor="#9CA3AF"
                    value={formData.medications}
                    onChangeText={(text) => setFormData({ ...formData, medications: text })}
                    returnKeyType="next"
                    maxLength={100}
                  />
                </View>
              </View>

              {/* Emergency Contact */}
              <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>Emergency Contact</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Emergency Contact Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter emergency contact name"
                    placeholderTextColor="#9CA3AF"
                    value={formData.emergencyContact}
                    onChangeText={(text) => setFormData({ ...formData, emergencyContact: text })}
                    returnKeyType="next"
                    maxLength={50}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Emergency Phone Number</Text>
                <View style={[styles.inputWrapper, errors.emergencyPhone && styles.inputError]}>
                  <Ionicons name="call" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="+92-300-1234567"
                    placeholderTextColor="#9CA3AF"
                    value={formData.emergencyPhone}
                    onChangeText={(text) => {
                      setFormData({ ...formData, emergencyPhone: text });
                      if (errors.emergencyPhone) setErrors({ ...errors, emergencyPhone: '' });
                    }}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                    maxLength={20}
                  />
                </View>
                {errors.emergencyPhone && <Text style={styles.errorText}>{errors.emergencyPhone}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Emergency Contact Relationship</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="people" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Father, Mother, Brother"
                    placeholderTextColor="#9CA3AF"
                    value={formData.emergencyRelationship}
                    onChangeText={(text) => setFormData({ ...formData, emergencyRelationship: text })}
                    returnKeyType="done"
                    maxLength={30}
                  />
                </View>
              </View>

              {/* Emergency Contact Info Box */}
              <View style={styles.emergencyInfoBox}>
                <Ionicons name="warning" size={20} color="#DC2626" />
                <Text style={styles.emergencyInfoText}>
                  This information will be available to emergency responders during an emergency.
                </Text>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveProfileButton, loading && styles.saveProfileButtonDisabled]}
                onPress={handleSave}
                activeOpacity={0.8}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#DC2626', '#B91C1C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveProfileGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.saveProfileButtonText}>Save Changes</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
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
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Content
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  contentContainer: {
    paddingTop: 20,
  },

  // Image Section
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  imageHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },

  // Form
  formSection: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionTitleSpacing: {
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  required: {
    color: '#DC2626',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: '#DC2626',
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: isSmallDevice ? 10 : 12,
    fontSize: isSmallDevice ? 14 : 15,
    color: '#1F2937',
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    minHeight: 50,
  },
  textArea: {
    minHeight: 50,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },

  // Emergency Info Box
  emergencyInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  emergencyInfoText: {
    flex: 1,
    fontSize: isSmallDevice ? 12 : 13,
    color: '#DC2626',
    fontWeight: '500',
  },

  // Save Button
  saveProfileButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  saveProfileGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveProfileButtonDisabled: {
    opacity: 0.7,
  },
  saveProfileButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default EditProfileScreen;