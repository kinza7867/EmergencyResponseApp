// src/screens/HomeScreen.tsx
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
  Switch,
  TouchableWithoutFeedback,
  TextInput,
  Modal,
  FlatList,
  Linking,
  Platform,
  Share,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGO = require('../../assets/logo.png');
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 380;

// Types
interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface MedicalProfileType {
  fullName: string;
  bloodGroup: string;
  allergies: string;
  diseases: string;
  medications: string;
  emergencyContact: string;
  notes: string;
}

interface SearchItem {
  id: string;
  title: string;
  screen: string;
  icon: string;
}

interface ServiceItem {
  id: string;
  label: string;
  icon: string;
  number: string;
  color: string;
  iconSet: string;
  description: string;
  situations: string[];
  instructions: string;
  action: string;
}

interface QuickActionItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  onPress: () => void;
}

interface SafetyToolItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  onPress: () => void;
}

interface SidebarMenuItem {
  id: string;
  label: string;
  screen: string | null;
  icon: string;
}

export const HomeScreen = ({ navigation }: any) => {
  const { user, signOut } = useAuth();
  
  // States
  const [isLocationSharing, setIsLocationSharing] = useState<boolean>(false);
  const [torchActive, setTorchActive] = useState<boolean>(false);
  const [sirenActive, setSirenActive] = useState<boolean>(false);
  const [recordingActive, setRecordingActive] = useState<boolean>(false);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>('home');
  const [searchModalVisible, setSearchModalVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [isMedicalCardVisible, setIsMedicalCardVisible] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { id: '1', text: 'Emergency contacts saved', checked: false },
    { id: '2', text: 'First aid kit ready', checked: false },
    { id: '3', text: 'Emergency plan discussed', checked: false },
    { id: '4', text: 'Important documents ready', checked: false },
    { id: '5', text: 'Emergency supplies stocked', checked: false },
    { id: '6', text: 'Fire extinguisher available', checked: false },
    { id: '7', text: 'Emergency numbers displayed', checked: false },
    { id: '8', text: 'Escape route planned', checked: false },
  ]);
  const [checklistModalVisible, setChecklistModalVisible] = useState<boolean>(false);
  
  // Modal states
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [serviceModalVisible, setServiceModalVisible] = useState<boolean>(false);
  const [medicalModalVisible, setMedicalModalVisible] = useState<boolean>(false);
  
  // Medical profile states
  const [medicalProfile, setMedicalProfile] = useState<MedicalProfileType>({
    fullName: '',
    bloodGroup: '',
    allergies: '',
    diseases: '',
    medications: '',
    emergencyContact: '',
    notes: '',
  });
  
  const [tempMedicalProfile, setTempMedicalProfile] = useState<MedicalProfileType>({
    fullName: '',
    bloodGroup: '',
    allergies: '',
    diseases: '',
    medications: '',
    emergencyContact: '',
    notes: '',
  });

  // Animations
  const sosScale = useRef(new Animated.Value(1)).current;
  const sidebarAnim = useRef(new Animated.Value(-width * 0.75)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const searchFadeAnim = useRef(new Animated.Value(0)).current;
  const medicalCardAnim = useRef(new Animated.Value(0)).current;
  const recordingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // SOS Pulse Animation - slightly zoom in and out
    Animated.loop(
      Animated.sequence([
        Animated.timing(sosScale, { 
          toValue: 1.08, 
          duration: 1000, 
          useNativeDriver: true,
        }),
        Animated.timing(sosScale, { 
          toValue: 0.92, 
          duration: 1000, 
          useNativeDriver: true,
        }),
      ])
    ).start();

    loadMedicalProfile();
    loadChecklist();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, []);

  const loadMedicalProfile = async () => {
    try {
      const saved = await AsyncStorage.getItem('medicalProfile');
      if (saved) {
        const parsed = JSON.parse(saved);
        setMedicalProfile(parsed);
        setTempMedicalProfile(parsed);
      }
    } catch (error) {
      console.log('Error loading medical profile:', error);
    }
  };

  const saveMedicalProfileToStorage = async (profile: MedicalProfileType) => {
    try {
      await AsyncStorage.setItem('medicalProfile', JSON.stringify(profile));
    } catch (error) {
      console.log('Error saving medical profile:', error);
    }
  };

  const loadChecklist = async () => {
    try {
      const saved = await AsyncStorage.getItem('checklist');
      if (saved) {
        setChecklistItems(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error loading checklist:', error);
    }
  };

  const saveChecklist = async (items: ChecklistItem[]) => {
    try {
      await AsyncStorage.setItem('checklist', JSON.stringify(items));
    } catch (error) {
      console.log('Error saving checklist:', error);
    }
  };

  // Sidebar functions
  const openSidebar = () => {
    setSidebarVisible(true);
    Animated.parallel([
      Animated.timing(sidebarAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0.5, duration: 300, useNativeDriver: false }),
    ]).start();
    Vibration.vibrate(30);
  };

  const closeSidebar = () => {
    Animated.parallel([
      Animated.timing(sidebarAnim, { toValue: -width * 0.75, duration: 300, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 300, useNativeDriver: false }),
    ]).start(() => setSidebarVisible(false));
    Vibration.vibrate(20);
  };

  const navigateTo = (screen: string) => {
    closeSidebar();
    setTimeout(() => navigation.navigate(screen), 350);
  };

  const handleLogout = async () => {
    closeSidebar();
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            await signOut();
            navigation.replace('Login');
          }
        },
      ]
    );
  };

  // SOS Functions
  const handleSOSPressIn = () => {
    Animated.timing(sosScale, { 
      toValue: 0.85, 
      duration: 100, 
      useNativeDriver: true 
    }).start();
  };

  const handleSOSRelease = () => {
    Animated.spring(sosScale, { 
      toValue: 1, 
      friction: 3, 
      tension: 40, 
      useNativeDriver: true 
    }).start();
    Vibration.vibrate([0, 200, 100, 200, 100, 300]);
    navigation.navigate('SOS');
  };

  // Emergency Service Modal
  const openServiceModal = (service: ServiceItem) => {
    setSelectedService(service);
    setServiceModalVisible(true);
    Vibration.vibrate(30);
  };

  const closeServiceModal = () => {
    setServiceModalVisible(false);
    setSelectedService(null);
  };

  // Medical Profile Modal
  const openMedicalModal = () => {
    setTempMedicalProfile({ ...medicalProfile });
    setMedicalModalVisible(true);
    Vibration.vibrate(30);
  };

  const closeMedicalModal = () => {
    setMedicalModalVisible(false);
  };

  const saveMedicalProfile = () => {
    setMedicalProfile({ ...tempMedicalProfile });
    saveMedicalProfileToStorage(tempMedicalProfile);
    closeMedicalModal();
    Alert.alert('Profile Saved', 'Your medical profile has been updated successfully.');
  };

  // Location Sharing
  const handleLocationToggle = async (value: boolean) => {
    if (value) {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        const { latitude, longitude } = location.coords;
        
        let address = 'Current Location';
        try {
          const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (geo && geo[0]) {
            const g = geo[0];
            address = [g.street, g.city, g.region].filter(Boolean).join(', ') || 'Current Location';
          }
        } catch (e) {
          address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        }
        
        setIsLocationSharing(true);
        setLocationStatus(`📍 ${address}`);
        
        Alert.alert(
          'Location Shared',
          `Your location is now being shared with emergency contacts.`,
          [{ text: 'OK' }]
        );
        Vibration.vibrate(60);
      } catch (error: any) {
        console.log('Location error:', error);
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            });
            const { latitude, longitude } = location.coords;
            setIsLocationSharing(true);
            setLocationStatus(`📍 ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            Alert.alert('Location Shared', 'Your location is now being shared.');
          } else {
            Alert.alert('Location Error', 'Unable to access location. Please enable location services.');
            setIsLocationSharing(false);
          }
        } catch (e) {
          Alert.alert('Location Error', 'Unable to access location. Please enable location services.');
          setIsLocationSharing(false);
        }
      }
    } else {
      setIsLocationSharing(false);
      setLocationStatus('');
      Alert.alert('Location Sharing Off', 'Your location is no longer being shared.');
    }
  };

  // Siren
  const playSiren = async () => {
    if (sirenActive) {
      setSirenActive(false);
      Vibration.cancel();
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      Alert.alert('Siren Stopped', 'Siren has been turned off.');
      return;
    }

    try {
      Alert.alert(
        'Siren Activated',
        'Emergency siren is now active.\n\nTap "STOP SIREN" to turn off.',
        [
          { 
            text: 'STOP SIREN', 
            style: 'destructive',
            onPress: async () => {
              setSirenActive(false);
              Vibration.cancel();
              if (sound) {
                await sound.stopAsync();
                await sound.unloadAsync();
                setSound(null);
              }
            }
          },
          { text: 'Keep On', style: 'default' }
        ]
      );
      
      setSirenActive(true);
      Vibration.vibrate([0, 300, 200, 200, 200, 300, 200, 200], true);
      
    } catch (error) {
      Alert.alert('Error', 'Unable to play siren.');
    }
  };

  // Audio Recording
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission Required', 'Microphone access is needed to record audio.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { Recording } = Audio;
      const newRecording = new Recording();
      
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      await newRecording.startAsync();
      
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingActive(true);
      setRecordingDuration(0);
      
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      Vibration.vibrate(50);
    } catch (error) {
      console.log('Recording error:', error);
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  const stopRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
        setIsRecording(false);
        setRecordingActive(false);
        
        if (recordingTimer.current) {
          clearInterval(recordingTimer.current);
          recordingTimer.current = null;
        }
        
        Alert.alert(
          'Recording Stopped',
          `Recording duration: ${formatTime(recordingDuration)}`,
          [
            { text: 'Discard', style: 'cancel', onPress: () => setRecordingDuration(0) },
            { text: 'Save', style: 'default', onPress: () => {
              Alert.alert('Saved', 'Audio recording saved successfully!');
              setRecordingDuration(0);
            }},
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRecordingToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Torch
  const handleTorchToggle = async () => {
    try {
      setTorchActive(!torchActive);
      Vibration.vibrate(50);
    } catch (error) {
      Alert.alert('Error', 'Unable to control torch.');
    }
  };

  // Search functionality
  const openSearch = () => {
    setSearchModalVisible(true);
    setSearchQuery('');
    setSearchResults([]);
    Animated.timing(searchFadeAnim, { 
      toValue: 1, 
      duration: 300, 
      useNativeDriver: true 
    }).start();
  };

  const closeSearch = () => {
    Animated.timing(searchFadeAnim, { 
      toValue: 0, 
      duration: 300, 
      useNativeDriver: true 
    }).start(() => {
      setSearchModalVisible(false);
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const allItems: SearchItem[] = [
        { id: '1', title: 'Home', screen: 'Home', icon: 'home' },
        { id: '2', title: 'SOS Alert', screen: 'SOS', icon: 'alert-circle' },
        { id: '3', title: 'Request History', screen: 'RequestHistory', icon: 'time' },
        { id: '4', title: 'My Profile', screen: 'Profile', icon: 'person' },
        { id: '5', title: 'Emergency Assistance', screen: 'InstantAssistance', icon: 'medkit' },
        { id: '6', title: 'Emergency Contacts', screen: 'EmergencyContacts', icon: 'people' },
        { id: '7', title: 'Settings', screen: 'Settings', icon: 'settings' },
        { id: '8', title: 'Notifications', screen: 'Notifications', icon: 'notifications' },
        { id: '9', title: 'Tracking', screen: 'Tracking', icon: 'navigate' },
        { id: '10', title: 'Hospital Selection', screen: 'HospitalSelection', icon: 'business' },
      ];
      const results = allItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchResultPress = (screen: string) => {
    closeSearch();
    setTimeout(() => navigation.navigate(screen), 350);
  };

  const getUserName = (): string => {
    if (user && user.name) {
      return user.name;
    }
    return 'User';
  };

  const getUserEmail = (): string => {
    if (user && user.email) {
      return user.email;
    }
    return 'user@email.com';
  };

  const getUserInitials = (): string => {
    const name = getUserName();
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Share App
  const shareApp = async () => {
    try {
      await Share.share({
        message: 'Emergency Response App - Get help instantly! Download now from the App Store.',
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share app.');
    }
  };

  // Toggle Medical Card
  const toggleMedicalCard = () => {
    setIsMedicalCardVisible(!isMedicalCardVisible);
    Animated.spring(medicalCardAnim, {
      toValue: isMedicalCardVisible ? 0 : 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Sidebar Menu Items
  const sidebarMenuItems: SidebarMenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', screen: 'Home', icon: 'grid' },
    { id: 'sos', label: 'SOS Alert', screen: 'SOS', icon: 'alert-circle' },
    { id: 'instant_help', label: 'Instant Assistance', screen: 'InstantAssistance', icon: 'medkit' },
    { id: 'emergency_contacts', label: 'Emergency Contacts', screen: 'EmergencyContacts', icon: 'people' },
    { id: 'history', label: 'Request History', screen: 'RequestHistory', icon: 'time' },
    { id: 'tracking', label: 'Tracking', screen: 'Tracking', icon: 'navigate' },
    { id: 'hospital', label: 'Hospital Selection', screen: 'HospitalSelection', icon: 'business' },
    { id: 'notifications', label: 'Notifications', screen: 'Notifications', icon: 'notifications' },
    { id: 'profile', label: 'My Profile', screen: 'Profile', icon: 'person' },
    { id: 'settings', label: 'Settings', screen: 'Settings', icon: 'settings' },
    { id: 'share', label: 'Share App', screen: null, icon: 'share' },
  ];

  // Handler for sidebar items
  const handleSidebarAction = (item: SidebarMenuItem) => {
    closeSidebar();
    
    if (item.id === 'share') {
      shareApp();
      return;
    }
    
    if (item.screen) {
      navigateTo(item.screen);
    }
  };

  // Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedicalProfile();
    await loadChecklist();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Emergency Services with detailed info
  const emergencyServices: ServiceItem[] = [
    { 
      id: 'ambulance',
      label: 'Ambulance', 
      icon: 'ambulance', 
      number: '1122', 
      color: '#DC2626', 
      iconSet: 'fontawesome5',
      description: 'Emergency medical response',
      situations: ['Severe injury', 'Chest pain', 'Unconsciousness', 'Heavy bleeding', 'Breathing difficulty'],
      instructions: 'Stay calm. Call immediately if you or someone nearby needs urgent medical care. Provide your exact location and describe the situation clearly.',
      action: 'Call Ambulance'
    },
    { 
      id: 'police',
      label: 'Police', 
      icon: 'shield', 
      number: '15', 
      color: '#3B82F6', 
      iconSet: 'ionicons',
      description: 'Law enforcement response',
      situations: ['Crime in progress', 'Suspicious activity', 'Robbery', 'Assault', 'Missing person'],
      instructions: 'Do not put yourself in danger. If you are safe, provide detailed information about the situation. Stay on the line and follow instructions.',
      action: 'Call Police'
    },
    { 
      id: 'fire',
      label: 'Fire Brigade', 
      icon: 'flame', 
      number: '16', 
      color: '#F97316', 
      iconSet: 'ionicons',
      description: 'Fire and rescue services',
      situations: ['Building fire', 'Gas leak', 'Vehicle fire', 'Bushfire', 'Smoke detection'],
      instructions: 'Evacuate the area immediately. Do not attempt to extinguish large fires yourself. Call from a safe distance.',
      action: 'Call Fire'
    },
    { 
      id: 'firstaid',
      label: 'First Aid', 
      icon: 'medkit', 
      number: '', 
      color: '#22C55E', 
      iconSet: 'ionicons',
      description: 'Quick first aid guidance',
      situations: ['Minor injuries', 'Burns', 'Cuts', 'Fractures', 'Choking'],
      instructions: 'Stay calm and assess the situation. Apply basic first aid if you are trained. Call emergency services if the situation is serious.',
      action: 'View First Aid'
    },
    { 
      id: 'hospital',
      label: 'Nearby Hospitals', 
      icon: 'business', 
      number: '', 
      color: '#8B5CF6', 
      iconSet: 'ionicons',
      description: 'Find nearest medical facilities',
      situations: ['Need emergency care', 'Medical consultation', 'Specialist treatment', 'Emergency room'],
      instructions: 'Find the nearest hospital for medical attention. Check hospital ratings and services before visiting.',
      action: 'Find Hospitals'
    },
  ];

  // Get service modal content
  const getServiceModalContent = (service: ServiceItem) => {
    switch(service.id) {
      case 'ambulance':
        return {
          icon: <FontAwesome5 name="ambulance" size={40} color="#DC2626" />,
          title: '🚑 Ambulance Service',
          subtitle: 'Emergency Medical Response',
          situations: service.situations,
          instructions: service.instructions,
          number: service.number,
          buttonText: '📞 Call Ambulance',
          color: '#DC2626'
        };
      case 'police':
        return {
          icon: <Ionicons name="shield" size={40} color="#3B82F6" />,
          title: '👮 Police Emergency',
          subtitle: 'Law Enforcement Response',
          situations: service.situations,
          instructions: service.instructions,
          number: service.number,
          buttonText: '📞 Call Police',
          color: '#3B82F6'
        };
      case 'fire':
        return {
          icon: <Ionicons name="flame" size={40} color="#F97316" />,
          title: '🚒 Fire Brigade',
          subtitle: 'Fire & Rescue Services',
          situations: service.situations,
          instructions: service.instructions,
          number: service.number,
          buttonText: '📞 Call Fire Brigade',
          color: '#F97316'
        };
      case 'firstaid':
        return {
          icon: <Ionicons name="medkit" size={40} color="#22C55E" />,
          title: '🩹 First Aid Guide',
          subtitle: 'Quick Emergency Guidance',
          situations: service.situations,
          instructions: service.instructions,
          number: '',
          buttonText: '📖 View First Aid',
          color: '#22C55E'
        };
      case 'hospital':
        return {
          icon: <Ionicons name="business" size={40} color="#8B5CF6" />,
          title: '🏥 Nearby Hospitals',
          subtitle: 'Find Medical Facilities',
          situations: service.situations,
          instructions: service.instructions,
          number: '',
          buttonText: '🔍 Find Hospitals',
          color: '#8B5CF6'
        };
      default:
        return null;
    }
  };

  // Render service icon
  const renderServiceIcon = (service: ServiceItem) => {
    const size = 22;
    const color = service.color;
    
    if (service.iconSet === 'fontawesome5') {
      return <FontAwesome5 name={service.icon as any} size={size} color={color} />;
    }
    return <Ionicons name={service.icon as any} size={size} color={color} />;
  };

  // Quick Actions
  const quickActions: QuickActionItem[] = [
    { 
      id: 'instant_help', 
      label: 'Emergency Help', 
      icon: 'medkit', 
      color: '#DC2626',
      description: 'Get immediate assistance',
      onPress: () => navigation.navigate('InstantAssistance')
    },
    { 
      id: 'tracking', 
      label: 'Live Tracking', 
      icon: 'navigate', 
      color: '#3B82F6',
      description: 'Share your location',
      onPress: () => navigation.navigate('Tracking')
    },
    { 
      id: 'hospital', 
      label: 'Find Hospital', 
      icon: 'business', 
      color: '#22C55E',
      description: 'Nearest medical facilities',
      onPress: () => navigation.navigate('HospitalSelection')
    },
    { 
      id: 'notifications', 
      label: 'Alerts', 
      icon: 'notifications', 
      color: '#F59E0B',
      description: 'View emergency alerts',
      onPress: () => navigation.navigate('Notifications')
    },
  ];

  // Safety Tools
  const safetyTools: SafetyToolItem[] = [
    { 
      id: 'share_location',
      label: 'Share Location', 
      icon: 'location', 
      color: '#DC2626',
      description: 'Share with contacts',
      onPress: () => handleLocationToggle(!isLocationSharing)
    },
    { 
      id: 'emergency_contacts',
      label: 'Emergency Contacts', 
      icon: 'people', 
      color: '#3B82F6',
      description: 'View saved contacts',
      onPress: () => navigation.navigate('EmergencyContacts')
    },
    { 
      id: 'safety_checklist',
      label: 'Safety Checklist', 
      icon: 'checkbox', 
      color: '#22C55E',
      description: 'Emergency preparedness',
      onPress: () => setChecklistModalVisible(true)
    },
    { 
      id: 'offline_guide',
      label: 'Offline Guide', 
      icon: 'book', 
      color: '#8B5CF6',
      description: 'Emergency survival guide',
      onPress: () => {
        Alert.alert(
          '📘 Emergency Survival Guide',
          '1. Stay calm and assess the situation\n\n2. Call emergency services immediately\n\n3. Follow instructions from authorities\n\n4. Help others if safe to do so\n\n5. Keep emergency supplies ready\n\n6. Stay informed through alerts\n\n7. Evacuate if instructed\n\n8. Keep your phone charged',
          [{ text: 'OK' }]
        );
      }
    },
  ];

  // Checklist functions
  const toggleChecklistItem = (id: string) => {
    const updated = checklistItems.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setChecklistItems(updated);
    saveChecklist(updated);
  };

  const getChecklistProgress = () => {
    const total = checklistItems.length;
    const done = checklistItems.filter(item => item.checked).length;
    return { total, done, percentage: (done / total) * 100 };
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />

      {/* Full Width Red Header */}
      <LinearGradient
        colors={['#DC2626', '#991B1B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.fullHeader}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={openSidebar} activeOpacity={0.7} style={styles.menuButton}>
            <View style={styles.menuIconWrapper}>
              <View style={[styles.menuLine, { width: 28, backgroundColor: '#FFFFFF' }]} />
              <View style={[styles.menuLine, { width: 20, backgroundColor: '#FFFFFF' }]} />
              <View style={[styles.menuLine, { width: 14, backgroundColor: '#FFFFFF' }]} />
            </View>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image source={LOGO} style={styles.headerLogo} resizeMode="contain" />
            <Text style={styles.headerTitle}>Emergency Response</Text>
          </View>

          <TouchableOpacity onPress={openSearch} activeOpacity={0.7} style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* User Profile Card in Header */}
        <TouchableOpacity 
          style={styles.userProfileCard}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{getUserInitials()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{getUserName()}</Text>
            <Text style={styles.userEmail}>{getUserEmail()}</Text>
          </View>
          <View style={styles.userBadge}>
            <Text style={styles.userBadgeText}>Citizen</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      {/* Sidebar Overlay */}
      {sidebarVisible && (
        <TouchableWithoutFeedback onPress={closeSidebar}>
          <Animated.View style={[styles.sidebarOverlay, { opacity: overlayAnim }]} />
        </TouchableWithoutFeedback>
      )}

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }], width: width * 0.75 }]}>
        <LinearGradient
          colors={['#DC2626', '#991B1B']}
          style={styles.sidebarHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.sidebarLogoWrapper}>
            <Image source={LOGO} style={styles.sidebarLogo} resizeMode="contain" />
          </View>
          <Text style={styles.sidebarAppName}>Emergency Response</Text>
          <Text style={styles.sidebarUserEmail}>{getUserEmail()}</Text>
          <View style={styles.sidebarUserBadge}>
            <Text style={styles.sidebarUserBadgeText}>Citizen User</Text>
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false}>
          {sidebarMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.sidebarItem, selectedTab === item.id && styles.sidebarItemActive]}
              onPress={() => {
                setSelectedTab(item.id);
                handleSidebarAction(item);
              }}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={item.icon as any} 
                size={22} 
                color={selectedTab === item.id ? '#DC2626' : '#4B5563'} 
                style={styles.sidebarItemIcon} 
              />
              <View style={styles.sidebarItemContent}>
                <Text style={[styles.sidebarItemText, selectedTab === item.id && styles.sidebarItemTextActive]}>
                  {item.label}
                </Text>
              </View>
              {selectedTab === item.id && <View style={styles.sidebarItemActiveIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sidebarDivider} />

        <TouchableOpacity style={[styles.sidebarItem, styles.sidebarLogout]} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out" size={22} color="#DC2626" style={styles.sidebarItemIcon} />
          <View style={styles.sidebarItemContent}>
            <Text style={[styles.sidebarItemText, styles.sidebarLogoutText]}>Logout</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sidebarVersion}>Emergency Response v1.0.0</Text>
      </Animated.View>

      {/* Search Modal */}
      <Modal
        visible={searchModalVisible}
        transparent
        animationType="none"
        onRequestClose={closeSearch}
      >
        <Animated.View style={[styles.searchModalContainer, { opacity: searchFadeAnim }]}>
          <View style={styles.searchModalContent}>
            <View style={styles.searchHeader}>
              <TouchableOpacity onPress={closeSearch} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={24} color="#1F2937" />
              </TouchableOpacity>
              <TextInput
                style={styles.searchInput}
                placeholder="Search Emergency Response..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')} activeOpacity={0.7}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {searchQuery.length > 0 && (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => handleSearchResultPress(item.screen)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={item.icon as any} size={22} color="#4B5563" style={styles.searchResultIcon} />
                    <Text style={styles.searchResultText}>{item.title}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.searchEmptyContainer}>
                    <Ionicons name="search" size={48} color="#D1D5DB" />
                    <Text style={styles.searchEmptyText}>No results found</Text>
                  </View>
                }
                contentContainerStyle={styles.searchResultsList}
              />
            )}

            {searchQuery.length === 0 && (
              <View style={styles.searchSuggestions}>
                <Text style={styles.searchSuggestionsTitle}>Quick Actions</Text>
                {['SOS Alert', 'Emergency Help', 'Request History', 'My Profile'].map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.searchSuggestionItem}
                    onPress={() => {
                      const screens: Record<string, string> = {
                        'SOS Alert': 'SOS',
                        'Emergency Help': 'InstantAssistance',
                        'Request History': 'RequestHistory',
                        'My Profile': 'Profile',
                      };
                      handleSearchResultPress(screens[item]);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="arrow-forward" size={16} color="#9CA3AF" style={styles.searchSuggestionIcon} />
                    <Text style={styles.searchSuggestionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </Modal>

      {/* Service Modal */}
      <Modal
        visible={serviceModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeServiceModal}
      >
        <TouchableWithoutFeedback onPress={closeServiceModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.serviceModalContainer}>
                {selectedService && getServiceModalContent(selectedService) && (
                  <>
                    <View style={styles.serviceModalHeader}>
                      <View style={[styles.serviceModalIconContainer, { backgroundColor: getServiceModalContent(selectedService)?.color + '20' }]}>
                        {getServiceModalContent(selectedService)?.icon}
                      </View>
                      <TouchableOpacity onPress={closeServiceModal} style={styles.serviceModalClose}>
                        <Ionicons name="close" size={24} color="#6B7280" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.serviceModalTitle}>
                      {getServiceModalContent(selectedService)?.title}
                    </Text>
                    <Text style={styles.serviceModalSubtitle}>
                      {getServiceModalContent(selectedService)?.subtitle}
                    </Text>

                    <View style={styles.serviceModalDivider} />

                    <Text style={styles.serviceModalSectionTitle}>Use this service if:</Text>
                    {getServiceModalContent(selectedService)?.situations.map((situation: string, index: number) => (
                      <View key={index} style={styles.serviceModalSituationItem}>
                        <Ionicons name="checkmark-circle" size={16} color={getServiceModalContent(selectedService)?.color || '#22C55E'} />
                        <Text style={styles.serviceModalSituationText}>{situation}</Text>
                      </View>
                    ))}

                    <View style={styles.serviceModalDivider} />

                    <Text style={styles.serviceModalSectionTitle}>Important Instructions:</Text>
                    <Text style={styles.serviceModalInstructions}>
                      {getServiceModalContent(selectedService)?.instructions}
                    </Text>

                    {getServiceModalContent(selectedService)?.number && (
                      <View style={[styles.serviceModalNumberContainer, { borderColor: getServiceModalContent(selectedService)?.color + '40' }]}>
                        <Text style={styles.serviceModalNumberLabel}>Emergency Number:</Text>
                        <Text style={[styles.serviceModalNumber, { color: getServiceModalContent(selectedService)?.color }]}>
                          {getServiceModalContent(selectedService)?.number}
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity 
                      style={[styles.serviceModalButton, { backgroundColor: getServiceModalContent(selectedService)?.color || '#DC2626' }]}
                      onPress={() => {
                        closeServiceModal();
                        if (selectedService.id === 'firstaid') {
                          Alert.alert(
                            '🩹 First Aid Guide',
                            'Basic First Aid Steps:\n\n1. Check the scene for safety\n2. Call for help if needed\n3. Check for breathing and pulse\n4. Control bleeding with pressure\n5. Treat for shock\n6. Keep victim warm\n7. Monitor vital signs\n8. Wait for professional help',
                            [{ text: 'OK' }]
                          );
                        } else if (selectedService.id === 'hospital') {
                          navigation.navigate('HospitalSelection');
                        } else {
                          const phoneNumber = Platform.OS === 'android' ? `tel:${selectedService.number}` : `telprompt:${selectedService.number}`;
                          Linking.openURL(phoneNumber).catch(() => {
                            Alert.alert('Error', 'Unable to make call. Please dial manually.');
                          });
                        }
                      }}
                    >
                      <Text style={styles.serviceModalButtonText}>
                        {getServiceModalContent(selectedService)?.buttonText}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Medical Profile Modal */}
      <Modal
        visible={medicalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeMedicalModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.medicalModalContainer}>
            <View style={styles.medicalModalHeader}>
              <Text style={styles.medicalModalTitle}>Medical Profile</Text>
              <TouchableOpacity onPress={closeMedicalModal}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.medicalModalField}>
                <Text style={styles.medicalModalLabel}>Full Name</Text>
                <TextInput
                  style={styles.medicalModalInput}
                  value={tempMedicalProfile.fullName}
                  onChangeText={(text) => setTempMedicalProfile({...tempMedicalProfile, fullName: text})}
                  placeholder="Enter full name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.medicalModalField}>
                <Text style={styles.medicalModalLabel}>Blood Group</Text>
                <TextInput
                  style={styles.medicalModalInput}
                  value={tempMedicalProfile.bloodGroup}
                  onChangeText={(text) => setTempMedicalProfile({...tempMedicalProfile, bloodGroup: text})}
                  placeholder="e.g., A+, B-, O+"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.medicalModalField}>
                <Text style={styles.medicalModalLabel}>Allergies</Text>
                <TextInput
                  style={styles.medicalModalInput}
                  value={tempMedicalProfile.allergies}
                  onChangeText={(text) => setTempMedicalProfile({...tempMedicalProfile, allergies: text})}
                  placeholder="e.g., Penicillin, Latex"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.medicalModalField}>
                <Text style={styles.medicalModalLabel}>Existing Diseases</Text>
                <TextInput
                  style={styles.medicalModalInput}
                  value={tempMedicalProfile.diseases}
                  onChangeText={(text) => setTempMedicalProfile({...tempMedicalProfile, diseases: text})}
                  placeholder="e.g., Asthma, Diabetes"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.medicalModalField}>
                <Text style={styles.medicalModalLabel}>Current Medications</Text>
                <TextInput
                  style={styles.medicalModalInput}
                  value={tempMedicalProfile.medications}
                  onChangeText={(text) => setTempMedicalProfile({...tempMedicalProfile, medications: text})}
                  placeholder="e.g., Salbutamol, Insulin"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.medicalModalField}>
                <Text style={styles.medicalModalLabel}>Emergency Contact</Text>
                <TextInput
                  style={styles.medicalModalInput}
                  value={tempMedicalProfile.emergencyContact}
                  onChangeText={(text) => setTempMedicalProfile({...tempMedicalProfile, emergencyContact: text})}
                  placeholder="e.g., 0300-1234567"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.medicalModalField}>
                <Text style={styles.medicalModalLabel}>Notes</Text>
                <TextInput
                  style={[styles.medicalModalInput, styles.medicalModalTextArea]}
                  value={tempMedicalProfile.notes}
                  onChangeText={(text) => setTempMedicalProfile({...tempMedicalProfile, notes: text})}
                  placeholder="Any additional medical notes"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity style={styles.medicalModalSaveButton} onPress={saveMedicalProfile}>
                <Text style={styles.medicalModalSaveButtonText}>Save Profile</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Checklist Modal */}
      <Modal
        visible={checklistModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setChecklistModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.medicalModalContainer}>
            <View style={styles.medicalModalHeader}>
              <Text style={styles.medicalModalTitle}>Safety Checklist</Text>
              <TouchableOpacity onPress={() => setChecklistModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.checklistProgressContainer}>
              <Text style={styles.checklistProgressText}>
                {getChecklistProgress().done} of {getChecklistProgress().total} completed
              </Text>
              <View style={styles.checklistProgressBar}>
                <View style={[styles.checklistProgressFill, { width: `${getChecklistProgress().percentage}%` }]} />
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {checklistItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.checklistItem}
                  onPress={() => toggleChecklistItem(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checklistBox, item.checked && styles.checklistBoxChecked]}>
                    {item.checked && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </View>
                  <Text style={[styles.checklistItemText, item.checked && styles.checklistItemTextDone]}>
                    {item.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Main Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#DC2626']} />
        }
      >
        {/* Dashboard Metrics */}
        <View style={styles.metricGrid}>
          <View style={[styles.metricCard, styles.metricCardShadow]}>
            <View style={[styles.metricIconContainer, styles.metricIconRed]}>
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.metricValue}>Safe</Text>
            <Text style={styles.metricLabel}>Current Status</Text>
          </View>
          <View style={[styles.metricCard, styles.metricCardShadow]}>
            <View style={[styles.metricIconContainer, styles.metricIconRed]}>
              <Ionicons name="call" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.metricValue}>3</Text>
            <Text style={styles.metricLabel}>Nearby Ambulances</Text>
          </View>
          <View style={[styles.metricCard, styles.metricCardShadow]}>
            <View style={[styles.metricIconContainer, styles.metricIconRed]}>
              <Ionicons name="people" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.metricValue}>5</Text>
            <Text style={styles.metricLabel}>Saved Contacts</Text>
          </View>
          <View style={[styles.metricCard, styles.metricCardShadow]}>
            <View style={[styles.metricIconContainer, styles.metricIconRed]}>
              <Ionicons name="time" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.metricValue}>None</Text>
            <Text style={styles.metricLabel}>Active Requests</Text>
          </View>
        </View>

        {/* SOS Button */}
        <View style={styles.sosOuterContainer}>
          <Animated.View style={[styles.sosContainer, { transform: [{ scale: sosScale }] }]}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPressIn={handleSOSPressIn}
              onPress={handleSOSRelease}
              style={styles.sosButton}
            >
              <LinearGradient
                colors={['#DC2626', '#991B1B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sosGradient}
              >
                <Ionicons name="alert-circle" size={50} color="#FFFFFF" />
                <Text style={styles.sosText}>SOS</Text>
                <Text style={styles.sosSubtext}>Tap for Emergency</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity 
              key={action.id}
              style={[styles.quickActionCard, { borderTopColor: action.color, borderTopWidth: 3 }]}
              onPress={action.onPress}
              activeOpacity={0.8}
            >
              <Ionicons name={action.icon as any} size={26} color={action.color} />
              <Text style={styles.quickActionLabel}>{action.label}</Text>
              <Text style={styles.quickActionDesc} numberOfLines={1}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency Services */}
        <Text style={styles.sectionTitle}>Emergency Services</Text>
        <View style={styles.servicesGrid}>
          {emergencyServices.map((service, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.serviceCard, { borderLeftColor: service.color, borderLeftWidth: 4 }]}
              onPress={() => openServiceModal(service)}
              activeOpacity={0.8}
            >
              <View style={styles.serviceContent}>
                <View style={styles.serviceIconContainer}>
                  {renderServiceIcon(service)}
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={[styles.serviceLabel, { color: service.color }]}>{service.label}</Text>
                  <Text style={styles.serviceDescription} numberOfLines={1}>{service.description}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Safety Tools */}
        <Text style={styles.sectionTitle}>Safety Tools</Text>
        <View style={styles.safetyToolsGrid}>
          {safetyTools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={[styles.safetyToolCard, { borderTopColor: tool.color, borderTopWidth: 3 }]}
              onPress={tool.onPress}
              activeOpacity={0.8}
            >
              <Ionicons name={tool.icon as any} size={24} color={tool.color} />
              <Text style={styles.safetyToolLabel}>{tool.label}</Text>
              <Text style={styles.safetyToolDesc} numberOfLines={1}>{tool.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Medical Profile */}
        <Text style={styles.sectionTitle}>Medical Profile</Text>
        <TouchableOpacity 
          style={styles.medicalHeaderCard}
          onPress={toggleMedicalCard}
          activeOpacity={0.8}
        >
          <View style={styles.medicalHeaderLeft}>
            <Ionicons name="heart" size={22} color="#FFFFFF" />
            <Text style={styles.medicalHeaderTitle}>Medical Information</Text>
          </View>
          <Ionicons name={isMedicalCardVisible ? 'chevron-up' : 'chevron-down'} size={22} color="#FFFFFF" />
        </TouchableOpacity>

        {isMedicalCardVisible && (
          <Animated.View 
            style={[
              styles.medicalCard,
              {
                opacity: medicalCardAnim,
                transform: [{ scale: medicalCardAnim }],
              }
            ]}
          >
            <View style={styles.medicalCardContent}>
              {medicalProfile.fullName ? (
                <>
                  <View style={styles.medicalCardHeader}>
                    <Text style={styles.medicalCardTitle}>MEDICAL INFORMATION</Text>
                    <TouchableOpacity onPress={openMedicalModal}>
                      <Text style={styles.medicalCardEdit}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.medicalDivider} />
                  
                  <View style={styles.medicalRow}>
                    <Text style={styles.medicalLabel}>Full Name</Text>
                    <Text style={styles.medicalValue}>{medicalProfile.fullName}</Text>
                  </View>
                  <View style={styles.medicalRow}>
                    <Text style={styles.medicalLabel}>Blood Group</Text>
                    <Text style={styles.medicalValue}>{medicalProfile.bloodGroup}</Text>
                  </View>
                  <View style={styles.medicalRow}>
                    <Text style={styles.medicalLabel}>Allergies</Text>
                    <Text style={styles.medicalValue}>{medicalProfile.allergies}</Text>
                  </View>
                  <View style={styles.medicalRow}>
                    <Text style={styles.medicalLabel}>Existing Diseases</Text>
                    <Text style={styles.medicalValue}>{medicalProfile.diseases}</Text>
                  </View>
                  <View style={styles.medicalRow}>
                    <Text style={styles.medicalLabel}>Medications</Text>
                    <Text style={styles.medicalValue}>{medicalProfile.medications}</Text>
                  </View>
                  <View style={styles.medicalRow}>
                    <Text style={styles.medicalLabel}>Emergency Contact</Text>
                    <Text style={styles.medicalValue}>{medicalProfile.emergencyContact}</Text>
                  </View>
                  {medicalProfile.notes && (
                    <View style={styles.medicalRow}>
                      <Text style={styles.medicalLabel}>Notes</Text>
                      <Text style={styles.medicalValue}>{medicalProfile.notes}</Text>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.noMedicalContainer}>
                  <Ionicons name="medical" size={48} color="#D1D5DB" />
                  <Text style={styles.noMedicalText}>No medical information added yet.</Text>
                  <Text style={styles.noMedicalSubText}>Add your medical details for emergency responders</Text>
                  <TouchableOpacity 
                    style={styles.noMedicalButton}
                    onPress={openMedicalModal}
                  >
                    <Text style={styles.noMedicalButtonText}>Add Medical Profile</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Local Alerts */}
        <Text style={styles.sectionTitle}>Local Alerts</Text>
        
        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <View style={styles.alertBadgeContainer}>
              <View style={[styles.alertBadge, styles.alertBadgeCritical]}>
                <Text style={styles.alertBadgeText}>CRITICAL</Text>
              </View>
              <Text style={styles.alertCategory}>Weather</Text>
            </View>
            <Text style={styles.alertTime}>3 min ago</Text>
          </View>
          <Text style={styles.alertTitle}>Flood Warning</Text>
          <Text style={styles.alertDesc}>Heavy rainfall in your area. Stay safe and avoid flooded roads.</Text>
          <TouchableOpacity style={styles.alertAction}>
            <Text style={styles.alertActionText}>Read More →</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.alertCard, styles.alertCardWarning]}>
          <View style={styles.alertHeader}>
            <View style={styles.alertBadgeContainer}>
              <View style={[styles.alertBadge, styles.alertBadgeWarning]}>
                <Text style={styles.alertBadgeText}>WEATHER</Text>
              </View>
              <Text style={styles.alertCategory}>Seismic</Text>
            </View>
            <Text style={styles.alertTime}>45 min ago</Text>
          </View>
          <Text style={styles.alertTitle}>Seismic Activity</Text>
          <Text style={styles.alertDesc}>Minor tremors recorded. No damage reported. Stay alert.</Text>
          <TouchableOpacity style={styles.alertAction}>
            <Text style={styles.alertActionText}>Read More →</Text>
          </TouchableOpacity>
        </View>

        {/* Safety Tip */}
        <Text style={styles.sectionTitle}>Safety Tip</Text>
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={22} color="#D97706" />
            <Text style={styles.tipTitle}>Tip of the Day</Text>
          </View>
          <Text style={styles.tipDesc}>Keep your emergency contacts updated and always share your location with trusted contacts.</Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },

  // Header
  fullHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  menuButton: {
    padding: 4,
  },
  menuIconWrapper: {
    width: 28,
    height: 20,
    justifyContent: 'space-between',
  },
  menuLine: {
    height: 2.5,
    borderRadius: 2,
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
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchButton: {
    padding: 4,
  },

  // User Profile Card
  userProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
  userBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },

  // Sidebar
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 999,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
    paddingTop: 40,
  },
  sidebarHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  sidebarLogoWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  sidebarLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  sidebarAppName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sidebarUserEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  sidebarUserBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  sidebarUserBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 10,
    position: 'relative',
  },
  sidebarItemActive: {
    backgroundColor: '#FEF2F2',
  },
  sidebarItemIcon: {
    marginRight: 14,
    width: 28,
    textAlign: 'center',
  },
  sidebarItemContent: {
    flex: 1,
  },
  sidebarItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  sidebarItemTextActive: {
    color: '#DC2626',
  },
  sidebarItemActiveIndicator: {
    position: 'absolute',
    right: 16,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
  },
  sidebarLogout: {
    marginBottom: 8,
  },
  sidebarLogoutText: {
    color: '#DC2626',
  },
  sidebarVersion: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
    paddingVertical: 12,
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },

  // Metrics
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: (width - 48) / 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  metricCardShadow: {
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  metricIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricIconRed: {
    backgroundColor: '#DC2626',
  },
  metricValue: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '800',
  },
  metricLabel: {
    color: '#6B7280',
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'center',
  },

  // SOS
  sosOuterContainer: {
    marginTop: 4,
    width: '100%',
    alignItems: 'center',
  },
  sosContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  sosGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 2,
  },
  sosSubtext: {
    color: '#FCA5A5',
    fontSize: 11,
    fontWeight: '500',
  },

  sectionTitle: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },

  // Quick Actions
  quickActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 8,
  },
  quickActionLabel: {
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  quickActionDesc: {
    color: '#9CA3AF',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 1,
  },

  // Services
  servicesGrid: {
    flexDirection: 'column',
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 8,
  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceIconContainer: {
    marginRight: 12,
    width: 30,
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  serviceDescription: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },

  // Safety Tools
  safetyToolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  safetyToolCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 8,
  },
  safetyToolLabel: {
    color: '#1F2937',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  safetyToolDesc: {
    color: '#9CA3AF',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 1,
  },

  // Medical
  medicalHeaderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  medicalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicalHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 10,
  },
  medicalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  medicalCardContent: {
    width: '100%',
  },
  medicalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicalCardTitle: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  medicalCardEdit: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  medicalDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  medicalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  medicalLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  medicalValue: {
    color: '#1F2937',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  noMedicalContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  noMedicalText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
  },
  noMedicalSubText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  noMedicalButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  noMedicalButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Medical Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicalModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  medicalModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  medicalModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  medicalModalField: {
    marginBottom: 12,
  },
  medicalModalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  medicalModalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  medicalModalTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  medicalModalSaveButton: {
    backgroundColor: '#DC2626',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  medicalModalSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Checklist Modal
  checklistProgressContainer: {
    marginBottom: 16,
  },
  checklistProgressText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  checklistProgressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  checklistProgressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 3,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  checklistBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checklistBoxChecked: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  checklistItemText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  checklistItemTextDone: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },

  // Service Modal
  serviceModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '92%',
    maxHeight: '80%',
  },
  serviceModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceModalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceModalClose: {
    padding: 4,
  },
  serviceModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  serviceModalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  serviceModalDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  serviceModalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  serviceModalSituationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceModalSituationText: {
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 8,
  },
  serviceModalInstructions: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  serviceModalNumberContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
  },
  serviceModalNumberLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  serviceModalNumber: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  serviceModalButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  serviceModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Alerts
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  alertCardWarning: {
    borderLeftColor: '#F59E0B',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  alertBadgeCritical: {
    backgroundColor: '#FEF2F2',
  },
  alertBadgeWarning: {
    backgroundColor: '#FFFBEB',
  },
  alertBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#DC2626',
  },
  alertCategory: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  alertTime: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '500',
  },
  alertTitle: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '700',
  },
  alertDesc: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  alertAction: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  alertActionText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '600',
  },

  // Tip
  tipCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderStyle: 'dashed',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tipTitle: {
    color: '#D97706',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  },
  tipDesc: {
    color: '#4B5563',
    fontSize: 12,
    lineHeight: 18,
  },

  // Search Modal
  searchModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  searchModalContent: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    padding: 16,
    minHeight: height * 0.6,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchResultsList: {
    paddingTop: 12,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchResultIcon: {
    marginRight: 12,
  },
  searchResultText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  searchEmptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  searchEmptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  searchSuggestions: {
    paddingTop: 16,
  },
  searchSuggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  searchSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchSuggestionIcon: {
    marginRight: 12,
  },
  searchSuggestionText: {
    fontSize: 14,
    color: '#1F2937',
  },
});

export default HomeScreen;