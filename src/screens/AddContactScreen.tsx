// src/screens/AddContactScreen.tsx
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
  Switch,
  ActivityIndicator, 
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Contacts from 'expo-contacts';
import * as ImagePicker from 'expo-image-picker';

const LOGO = require('../../assets/logo.png');
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 380;

interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  relationship: string;
  isEmergency: boolean;
  notes: string;
}

export const AddContactScreen = ({ navigation, route }: any) => {
  const { contact: existingContact } = route.params || {};
  const isEditing = !!existingContact;

  const [formData, setFormData] = useState<ContactFormData>({
    name: existingContact?.name || '',
    phone: existingContact?.phone || '',
    email: existingContact?.email || '',
    relationship: existingContact?.relationship || '',
    isEmergency: existingContact?.isEmergency || false,
    notes: existingContact?.notes || '',
  });

  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);

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

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-() ]{7,20}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.relationship.trim()) {
      newErrors.relationship = 'Relationship is required';
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
      // Get existing contacts
      const saved = await AsyncStorage.getItem('emergencyContacts');
      let contacts = saved ? JSON.parse(saved) : [];

      const newContact = {
        id: isEditing ? existingContact.id : Date.now().toString(),
        ...formData,
        photo: selectedImage || existingContact?.photo || null,
        createdAt: isEditing ? existingContact.createdAt : new Date().toISOString(),
      };

      if (isEditing) {
        contacts = contacts.map((c: any) => c.id === existingContact.id ? newContact : c);
      } else {
        contacts = [newContact, ...contacts];
      }

      await AsyncStorage.setItem('emergencyContacts', JSON.stringify(contacts));

      Alert.alert(
        'Success',
        `Contact ${isEditing ? 'updated' : 'added'} successfully!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save contact. Please try again.');
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

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        Vibration.vibrate(20);
      }
    } catch (error) {
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

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        Vibration.vibrate(20);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Gallery', onPress: handlePickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleDeleteImage = () => {
    setSelectedImage(null);
    Vibration.vibrate(20);
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
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
            <Text style={styles.headerTitle}>
              {isEditing ? 'Edit Contact' : 'Add Contact'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.7}
            style={styles.saveButton}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
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
                {selectedImage || existingContact?.photo ? (
                  <Image
                    source={{ uri: selectedImage || existingContact?.photo }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={[styles.placeholderImage, { backgroundColor: getRandomColor(formData.name || '?') }]}>
                    <Text style={styles.placeholderText}>
                      {getInitials(formData.name)}
                    </Text>
                  </View>
                )}
                <View style={styles.cameraIconContainer}>
                  <Ionicons name="camera" size={18} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              {(selectedImage || existingContact?.photo) && (
                <TouchableOpacity
                  style={styles.deleteImageButton}
                  onPress={handleDeleteImage}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={20} color="#DC2626" />
                </TouchableOpacity>
              )}
              <Text style={styles.imageHint}>Tap to add photo</Text>
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                  <Ionicons name="person" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter full name"
                    placeholderTextColor="#9CA3AF"
                    value={formData.name}
                    onChangeText={(text) => {
                      setFormData({ ...formData, name: text });
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    returnKeyType="next"
                  />
                </View>
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputWrapper, errors.phone && styles.inputError]}>
                  <Ionicons name="call" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., +92-300-1234567"
                    placeholderTextColor="#9CA3AF"
                    value={formData.phone}
                    onChangeText={(text) => {
                      setFormData({ ...formData, phone: text });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                  />
                </View>
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                  <Ionicons name="mail" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter email address"
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
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Relationship <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputWrapper, errors.relationship && styles.inputError]}>
                  <Ionicons name="people" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Brother, Mother, Doctor"
                    placeholderTextColor="#9CA3AF"
                    value={formData.relationship}
                    onChangeText={(text) => {
                      setFormData({ ...formData, relationship: text });
                      if (errors.relationship) setErrors({ ...errors, relationship: '' });
                    }}
                    returnKeyType="next"
                  />
                </View>
                {errors.relationship && <Text style={styles.errorText}>{errors.relationship}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notes</Text>
                <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                  <Ionicons name="document-text" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Add any additional notes..."
                    placeholderTextColor="#9CA3AF"
                    value={formData.notes}
                    onChangeText={(text) => setFormData({ ...formData, notes: text })}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Emergency Toggle */}
              <View style={styles.toggleContainer}>
                <View style={styles.toggleLeft}>
                  <Ionicons
                    name="alert-circle"
                    size={22}
                    color={formData.isEmergency ? '#DC2626' : '#6B7280'}
                  />
                  <View>
                    <Text style={styles.toggleLabel}>Emergency Contact</Text>
                    <Text style={styles.toggleSubLabel}>
                      Mark as primary emergency contact
                    </Text>
                  </View>
                </View>
                <Switch
                  value={formData.isEmergency}
                  onValueChange={(value) => {
                    setFormData({ ...formData, isEmergency: value });
                    Vibration.vibrate(20);
                  }}
                  trackColor={{ false: '#E5E7EB', true: '#DC2626' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Emergency Badge Preview */}
              {formData.isEmergency && (
                <View style={styles.emergencyPreview}>
                  <Ionicons name="warning" size={16} color="#DC2626" />
                  <Text style={styles.emergencyPreviewText}>
                    This contact will be notified during emergencies
                  </Text>
                </View>
              )}

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveContactButton, loading && styles.saveContactButtonDisabled]}
                onPress={handleSave}
                activeOpacity={0.8}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#DC2626', '#B91C1C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveContactGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.saveContactButtonText}>
                      {isEditing ? 'Update Contact' : 'Add Contact'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Delete Button (Edit Mode) */}
              {isEditing && (
                <TouchableOpacity
                  style={styles.deleteContactButton}
                  onPress={() => {
                    Alert.alert(
                      'Delete Contact',
                      `Are you sure you want to delete ${formData.name}?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              const saved = await AsyncStorage.getItem('emergencyContacts');
                              let contacts = saved ? JSON.parse(saved) : [];
                              contacts = contacts.filter((c: any) => c.id !== existingContact.id);
                              await AsyncStorage.setItem('emergencyContacts', JSON.stringify(contacts));
                              Alert.alert('Success', 'Contact deleted successfully.');
                              navigation.goBack();
                            } catch (error) {
                              Alert.alert('Error', 'Failed to delete contact.');
                            }
                          }
                        }
                      ]
                    );
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteContactButtonText}>Delete Contact</Text>
                </TouchableOpacity>
              )}
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
  deleteImageButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
    minHeight: 80,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },

  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  toggleLabel: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  toggleSubLabel: {
    fontSize: 11,
    color: '#6B7280',
  },

  // Emergency Preview
  emergencyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  emergencyPreviewText: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#DC2626',
    fontWeight: '500',
    flex: 1,
  },

  // Save Button
  saveContactButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  saveContactGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveContactButtonDisabled: {
    opacity: 0.7,
  },
  saveContactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Delete Button
  deleteContactButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  deleteContactButtonText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default AddContactScreen;