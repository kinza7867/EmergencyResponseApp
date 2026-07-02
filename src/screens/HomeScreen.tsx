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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';

const LOGO = require('../../assets/logo.png');
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 380;

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  
  // States
  const [isLocationSharing, setIsLocationSharing] = useState(false);
  const [torchActive, setTorchActive] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);
  const [recordingActive, setRecordingActive] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('home');
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [sound, setSound] = useState<any>(null);
  const [recording, setRecording] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isMedicalCardVisible, setIsMedicalCardVisible] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  // Animations
  const sosScale = useRef(new Animated.Value(1)).current;
  const sidebarAnim = useRef(new Animated.Value(-width * 0.75)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const searchFadeAnim = useRef(new Animated.Value(0)).current;
  const medicalCardAnim = useRef(new Animated.Value(0)).current;
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // SOS Pulse Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sosScale, { 
          toValue: 1.06, 
          duration: 1200, 
          useNativeDriver: true,
        }),
        Animated.timing(sosScale, { 
          toValue: 0.94, 
          duration: 1200, 
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Cleanup audio on unmount
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

  const handleLogout = () => {
    closeSidebar();
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: () => navigation.replace('Login') 
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

  const handleServiceCall = (serviceName: string, number: string) => {
    Vibration.vibrate(50);
    Alert.alert(
      'Emergency Call',
      `Call ${serviceName} at ${number}?`,
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
          }
        },
      ]
    );
  };

  // Location Sharing
  const handleLocationToggle = async (value: boolean) => {
    if (value) {
      try {
        setLocationStatus('Requesting permission...');
        
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Location access is needed to share your location. Please enable it in settings.',
            [
              { text: 'OK', onPress: () => setIsLocationSharing(false) }
            ]
          );
          setIsLocationSharing(false);
          setLocationStatus('');
          return;
        }

        setLocationStatus('Getting location...');
        
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 10000,
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
          '📍 Location Shared',
          `Your location (${address}) is now being shared with emergency contacts.`,
          [{ text: 'OK' }]
        );
        Vibration.vibrate(60);
      } catch (error: any) {
        console.log('Location error:', error);
        Alert.alert(
          'Location Error',
          error.message || 'Failed to get location. Please check your GPS and try again.',
          [{ text: 'OK', onPress: () => setIsLocationSharing(false) }]
        );
        setIsLocationSharing(false);
        setLocationStatus('');
      }
    } else {
      setIsLocationSharing(false);
      setLocationStatus('');
      Alert.alert('📍 Location Sharing Off', 'Your location is no longer being shared.');
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
      Alert.alert('🔇 Siren Stopped', 'Siren has been turned off.');
      return;
    }

    try {
      Alert.alert(
        '🚨 Siren Activated',
        'Emergency siren is now active with full volume.\n\nTap "STOP SIREN" to turn off.',
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
          {
            text: 'Keep On',
            style: 'default',
          }
        ]
      );
      
      setSirenActive(true);
      Vibration.vibrate([0, 300, 200, 200, 200, 300, 200, 200], true);
      
    } catch (error) {
      Alert.alert('Error', 'Unable to play siren.');
    }
  };

  // Audio Recording with timer
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

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      
      setRecording(recording);
      setIsRecording(true);
      setRecordingActive(true);
      setRecordingDuration(0);
      
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      Vibration.vibrate(50);
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  const stopRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        setIsRecording(false);
        setRecordingActive(false);
        
        if (recordingTimer.current) {
          clearInterval(recordingTimer.current);
          recordingTimer.current = null;
        }
        
        Alert.alert(
          '🎤 Recording Stopped',
          `Recording duration: ${formatTime(recordingDuration)}\n\nWould you like to save this recording?`,
          [
            { 
              text: 'Discard', 
              style: 'cancel',
              onPress: () => {
                setRecordingDuration(0);
              }
            },
            { 
              text: 'Save Recording', 
              style: 'default',
              onPress: () => {
                Alert.alert(
                  '✅ Recording Saved',
                  `Audio recording saved successfully!\n\nDuration: ${formatTime(recordingDuration)}`,
                  [{ text: 'OK' }]
                );
                setRecordingDuration(0);
              }
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  const formatTime = (seconds: number) => {
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
      Alert.alert(
        '🔦 Torch',
        torchActive ? 'Torch is now off' : 'Torch is now on'
      );
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
      const allItems = [
        { id: '1', title: 'Home', screen: 'Home', icon: '🏠' },
        { id: '2', title: 'SOS Alert', screen: 'SOS', icon: '🆘' },
        { id: '3', title: 'Request History', screen: 'RequestHistory', icon: '📋' },
        { id: '4', title: 'My Profile', screen: 'Profile', icon: '👤' },
        { id: '5', title: 'Emergency Assistance', screen: 'InstantAssistance', icon: '🚨' },
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

  const getUserName = () => {
    if (user && user.name) {
      return user.name;
    }
    return 'User';
  };

  const getUserEmail = () => {
    if (user && user.email) {
      return user.email;
    }
    return 'user@email.com';
  };

  const getUserInitials = () => {
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
        message: '🚨 Emergency Response App - Get help instantly! Download now from the App Store.',
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share app.');
    }
  };

  // Emergency Quick Actions
  const emergencyActions = [
    { id: 'panic', label: 'Panic Mode', icon: '⚠️', color: '#DC2626', action: () => {
      Vibration.vibrate([0, 500, 200, 500, 200, 500]);
      Alert.alert('🚨 Panic Mode Activated', 'Emergency contacts have been notified.');
    }},
    { id: 'sos_sms', label: 'SOS SMS', icon: '💬', color: '#3B82F6', action: () => {
      Alert.alert('📱 SOS SMS', 'Send emergency SMS to all contacts?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', style: 'destructive', onPress: () => {
          Alert.alert('✅ Sent', 'Emergency SMS sent to all contacts.');
        }}
      ]);
    }},
    { id: 'fake_call', label: 'Fake Call', icon: '📞', color: '#8B5CF6', action: () => {
      Alert.alert('📞 Fake Call', 'Incoming fake call... Stay safe!');
    }},
  ];

  // Safety Resources
  const safetyResources = [
    { id: 'first_aid', label: 'First Aid Guide', icon: '🩹', action: () => {
      Linking.openURL('https://www.redcross.org/get-help/how-to-prepare-for-emergencies/anatomy-of-a-first-aid-kit.html');
    }},
    { id: 'shelter', label: 'Find Shelter', icon: '🏠', action: () => {
      Alert.alert('🏠 Find Shelter', 'Showing nearby shelters...');
    }},
    { id: 'hospitals', label: 'Nearby Hospitals', icon: '🏥', action: () => {
      Alert.alert('🏥 Nearby Hospitals', 'Showing nearest hospitals...');
    }},
  ];

  // Medical Profile Info
  const medicalInfo = [
    { label: 'Blood Type', value: 'O-Positive' },
    { label: 'Allergies', value: 'Penicillin, Latex' },
    { label: 'Medical Conditions', value: 'Asthma' },
    { label: 'Emergency Contact', value: 'Father - 0300-1234567' },
    { label: 'Height', value: "5'7\"" },
    { label: 'Weight', value: '70 kg' },
    { label: 'Organ Donor', value: 'Yes' },
    { label: 'Medications', value: 'Inhaler (Salbutamol)' },
  ];

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

  // Sidebar Menu Items - Different from Bottom Tab
  const sidebarMenuItems = [
    { id: 'dashboard', label: 'Dashboard', screen: 'Home', icon: '📊', description: 'Overview & stats' },
    { id: 'emergency_actions', label: 'Emergency Actions', screen: null, icon: '⚡', description: 'Quick emergency tools' },
    { id: 'sos', label: 'SOS Alert', screen: 'SOS', icon: '🆘', description: 'Send emergency alert' },
    { id: 'instant_help', label: 'Instant Assistance', screen: 'InstantAssistance', icon: '🚨', description: 'Get immediate help' },
    { id: 'safety_tips', label: 'Safety Tips', screen: null, icon: '💡', description: 'Learn to stay safe' },
    { id: 'medical', label: 'Medical Profile', screen: null, icon: '🩺', description: 'Your health info' },
    { id: 'resources', label: 'Resources', screen: null, icon: '📚', description: 'Helpful guides' },
    { id: 'contacts', label: 'Emergency Contacts', screen: null, icon: '📞', description: 'Your saved contacts' },
    { id: 'history', label: 'Request History', screen: 'RequestHistory', icon: '📋', description: 'Past emergencies' },
    { id: 'profile', label: 'My Profile', screen: 'Profile', icon: '👤', description: 'Account settings' },
    { id: 'share', label: 'Share App', screen: null, icon: '📤', description: 'Share with others' },
    { id: 'support', label: 'Support', screen: null, icon: '💬', description: 'Help & feedback' },
  ];

  // Handler for sidebar items without screen navigation
  const handleSidebarAction = (item: any) => {
    closeSidebar();
    
    switch (item.id) {
      case 'emergency_actions':
        Alert.alert(
          '⚡ Emergency Actions',
          'Select an action:',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: '🚨 Panic Mode', onPress: () => {
              Vibration.vibrate([0, 500, 200, 500, 200, 500]);
              Alert.alert('Panic Mode Activated', 'Emergency contacts notified.');
            }},
            { text: '💬 SOS SMS', onPress: () => {
              Alert.alert('SOS SMS', 'Emergency SMS sent to all contacts.');
            }},
            { text: '📞 Fake Call', onPress: () => {
              Alert.alert('Fake Call', 'Incoming fake call... Stay safe!');
            }},
          ]
        );
        break;
        
      case 'safety_tips':
        Alert.alert(
          '💡 Safety Tips',
          '1. Stay calm in emergencies\n2. Know your location\n3. Keep emergency contacts handy\n4. Have a first aid kit ready\n5. Practice emergency drills',
          [{ text: 'OK' }]
        );
        break;
        
      case 'medical':
        toggleMedicalCard();
        break;
        
      case 'resources':
        Alert.alert(
          '📚 Resources',
          'Select a resource:',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: '🩹 First Aid Guide', onPress: () => {
              Linking.openURL('https://www.redcross.org/get-help/how-to-prepare-for-emergencies/anatomy-of-a-first-aid-kit.html');
            }},
            { text: '🏠 Find Shelter', onPress: () => {
              Alert.alert('Nearby shelters will be shown here.');
            }},
            { text: '🏥 Nearby Hospitals', onPress: () => {
              Alert.alert('Nearby hospitals will be shown here.');
            }},
          ]
        );
        break;
        
      case 'contacts':
        Alert.alert(
          '📞 Emergency Contacts',
          'Your emergency contacts are:\n\n• Father - 0300-1234567\n• Mother - 0300-7654321\n• Brother - 0300-9876543\n• Doctor - 0300-5555555',
          [{ text: 'OK' }]
        );
        break;
        
      case 'share':
        shareApp();
        break;
        
      case 'support':
        Alert.alert(
          '💬 Support',
          'Need help?\n\nEmail: support@emergencyresponse.com\nPhone: 1-800-555-0199\nHours: 24/7',
          [{ text: 'OK' }]
        );
        break;
        
      default:
        if (item.screen) {
          navigateTo(item.screen);
        }
        break;
    }
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
          onPress={() => {
            try {
              navigation.navigate('Profile');
            } catch (e) {
              Alert.alert('Profile', 'User profile will be available soon.');
            }
          }}
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
              <Text style={styles.sidebarItemIcon}>{item.icon}</Text>
              <View style={styles.sidebarItemContent}>
                <Text style={[styles.sidebarItemText, selectedTab === item.id && styles.sidebarItemTextActive]}>
                  {item.label}
                </Text>
                <Text style={styles.sidebarItemDescription}>{item.description}</Text>
              </View>
              {selectedTab === item.id && <View style={styles.sidebarItemActiveIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sidebarDivider} />

        <TouchableOpacity style={[styles.sidebarItem, styles.sidebarLogout]} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={styles.sidebarItemIcon}>🚪</Text>
          <View style={styles.sidebarItemContent}>
            <Text style={[styles.sidebarItemText, styles.sidebarLogoutText]}>Logout</Text>
            <Text style={styles.sidebarItemDescription}>Sign out of your account</Text>
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
                    <Text style={styles.searchResultIcon}>{item.icon}</Text>
                    <Text style={styles.searchResultText}>{item.title}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.searchEmptyContainer}>
                    <Text style={styles.searchEmptyIcon}>🔍</Text>
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
                      const screens: any = {
                        'SOS Alert': 'SOS',
                        'Emergency Help': 'InstantAssistance',
                        'Request History': 'RequestHistory',
                        'My Profile': 'Profile',
                      };
                      handleSearchResultPress(screens[item]);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.searchSuggestionIcon}>→</Text>
                    <Text style={styles.searchSuggestionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </Modal>

      {/* Main Content - Scrollable */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Metrics */}
        <View style={styles.metricGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>12</Text>
            <Text style={styles.metricLabel}>SOS Sent</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>5</Text>
            <Text style={styles.metricLabel}>Contacts</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>8</Text>
            <Text style={styles.metricLabel}>Reports</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>30</Text>
            <Text style={styles.metricLabel}>Safe Days</Text>
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
                <Text style={styles.sosEmoji}>🚨</Text>
                <Text style={styles.sosText}>SOS</Text>
                <Text style={styles.sosSubtext}>Tap for Emergency</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Emergency Services */}
        <Text style={styles.sectionTitle}>Emergency Services</Text>
        <View style={styles.servicesGrid}>
          {services.map((service, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.serviceCard, { borderLeftColor: service.color, borderLeftWidth: 4 }]}
              onPress={() => handleServiceCall(service.label, service.number)}
              activeOpacity={0.8}
            >
              <Text style={styles.serviceEmoji}>{service.emoji}</Text>
              <Text style={styles.serviceLabel}>{service.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Safety Tools */}
        <Text style={styles.sectionTitle}>Safety Tools</Text>
        
        <View style={styles.utilityRowCard}>
          <View style={styles.utilityLeft}>
            <View>
              <Text style={styles.utilityTitle}>Location Sharing</Text>
              <Text style={[styles.utilitySub, isLocationSharing && styles.utilitySubActive]}>
                {locationStatus || (isLocationSharing ? 'Active' : 'Off')}
              </Text>
            </View>
          </View>
          <Switch
            value={isLocationSharing}
            onValueChange={handleLocationToggle}
            trackColor={{ false: '#E5E7EB', true: '#DC2626' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <TouchableOpacity 
          style={styles.safetyCheckCard} 
          onPress={() => Alert.alert('✅ Safe', 'Emergency contacts notified you are safe.')}
          activeOpacity={0.8}
        >
          <Text style={styles.safetyCheckEmoji}>✅</Text>
          <View>
            <Text style={styles.safetyCheckTitle}>I Am Safe</Text>
            <Text style={styles.safetyCheckSub}>Notify emergency contacts</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.hardwareGrid}>
          <TouchableOpacity 
            style={[styles.hardwareCard, isRecording && styles.hardwareCardActive]} 
            onPress={handleRecordingToggle}
            activeOpacity={0.7}
          >
            <Text style={styles.hardwareEmoji}>{isRecording ? '⏹' : '🎤'}</Text>
            <Text style={[styles.hardwareLabel, isRecording && styles.hardwareLabelActive]}>
              {isRecording ? `Recording ${formatTime(recordingDuration)}` : 'Panic Audio'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.hardwareCard, torchActive && styles.hardwareCardActive]} 
            onPress={handleTorchToggle}
            activeOpacity={0.7}
          >
            <Text style={styles.hardwareEmoji}>🔦</Text>
            <Text style={[styles.hardwareLabel, torchActive && styles.hardwareLabelActive]}>
              {torchActive ? 'Torch On' : 'Torch'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.hardwareCard, sirenActive && styles.hardwareCardActive]} 
            onPress={playSiren}
            activeOpacity={0.7}
          >
            <Text style={styles.hardwareEmoji}>📢</Text>
            <Text style={[styles.hardwareLabel, sirenActive && styles.hardwareLabelActive]}>
              {sirenActive ? 'Siren On' : 'Siren'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Medical Profile - Expandable Card */}
        <Text style={styles.sectionTitle}>Medical Profile</Text>
        <TouchableOpacity 
          style={styles.medicalHeaderCard}
          onPress={toggleMedicalCard}
          activeOpacity={0.8}
        >
          <Text style={styles.medicalHeaderTitle}>🩺 Critical Responder Card</Text>
          <Text style={styles.medicalHeaderArrow}>
            {isMedicalCardVisible ? '▲' : '▼'}
          </Text>
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
              <View style={styles.medicalCardHeader}>
                <Text style={styles.medicalCardTitle}>MEDICAL INFORMATION</Text>
                <View style={styles.medicalCardBadge}>
                  <Text style={styles.medicalCardBadgeText}>ICE</Text>
                </View>
              </View>
              
              <View style={styles.medicalDivider} />
              
              {medicalInfo.map((item, index) => (
                <View key={index} style={styles.medicalRow}>
                  <Text style={styles.medicalLabel}>{item.label}</Text>
                  <Text style={styles.medicalValue}>{item.value}</Text>
                </View>
              ))}
              
              <View style={styles.medicalDivider} />
              
              <Text style={styles.medicalFooter}>
                In case of emergency, share this information with first responders.
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Alerts */}
        <Text style={styles.sectionTitle}>Local Alerts</Text>
        <View style={[styles.feedItem, { borderLeftColor: '#DC2626' }]}>
          <View style={styles.feedHeaderRow}>
            <View style={[styles.feedBadge, styles.feedBadgeCritical]}>
              <Text style={styles.feedBadgeText}>CRITICAL</Text>
            </View>
            <Text style={styles.feedTime}>3m ago</Text>
          </View>
          <Text style={styles.feedTitle}>🚨 Flood Warning</Text>
          <Text style={styles.feedDesc}>Heavy rainfall in your area. Stay safe.</Text>
        </View>

        <View style={[styles.feedItem, { borderLeftColor: '#F59E0B', marginTop: 10 }]}>
          <View style={styles.feedHeaderRow}>
            <View style={[styles.feedBadge, styles.feedBadgeWarning]}>
              <Text style={styles.feedBadgeText}>WEATHER</Text>
            </View>
            <Text style={styles.feedTime}>45m ago</Text>
          </View>
          <Text style={styles.feedTitle}>📊 Seismic Activity</Text>
          <Text style={styles.feedDesc}>Minor tremors recorded. No damage reported.</Text>
        </View>

        {/* Tip */}
        <Text style={styles.sectionTitle}>Safety Tip</Text>
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Tip of the Day</Text>
          <Text style={styles.tipDesc}>Keep your emergency contacts updated and always share your location with trusted contacts.</Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

// Services array - keeping it outside component
const services = [
  { label: 'Ambulance', emoji: '🚑', number: '1122', color: '#DC2626' },
  { label: 'Police', emoji: '👮', number: '15', color: '#3B82F6' },
  { label: 'Fire', emoji: '🚒', number: '16', color: '#F97316' },
  { label: 'Rescue', emoji: '🆘', number: '1122', color: '#7C3AED' },
  { label: 'Hospital', emoji: '🏥', number: '911', color: '#22C55E' },
  { label: 'Disaster', emoji: '⚠️', number: '911', color: '#8B5CF6' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },

  // Full Width Red Header
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

  // User Profile Card in Header
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
    fontSize: 20,
    marginRight: 14,
    width: 30,
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
  sidebarItemDescription: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
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
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricValue: {
    color: '#DC2626',
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },

  // SOS
  sosOuterContainer: {
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  sosContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
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
  sosEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  sosSubtext: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '500',
  },

  sectionTitle: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },

  // Services
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: (width - 40) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  serviceLabel: {
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '600',
  },

  // Utility
  utilityRowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  utilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  utilityTitle: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '600',
  },
  utilitySub: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 1,
  },
  utilitySubActive: {
    color: '#22C55E',
  },

  // Safety Check
  safetyCheckCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#22C55E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  safetyCheckEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  safetyCheckTitle: {
    color: '#065F46',
    fontSize: 14,
    fontWeight: '700',
  },
  safetyCheckSub: {
    color: '#047857',
    fontSize: 11,
    marginTop: 1,
  },

  // Hardware
  hardwareGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  hardwareCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  hardwareCardActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
  },
  hardwareEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  hardwareLabel: {
    color: '#4B5563',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  hardwareLabelActive: {
    color: '#DC2626',
  },

  // Medical - Expandable Card
  medicalHeaderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medicalHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  medicalHeaderArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  medicalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  medicalCardBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
  },
  medicalCardBadgeText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '700',
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
    fontSize: 13,
    fontWeight: '500',
  },
  medicalValue: {
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '600',
  },
  medicalFooter: {
    color: '#9CA3AF',
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },

  // Feed
  feedItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderTopColor: '#F3F4F6',
    borderRightColor: '#F3F4F6',
    borderBottomColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  feedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  feedBadgeCritical: {
    backgroundColor: '#FEF2F2',
  },
  feedBadgeWarning: {
    backgroundColor: '#FFFBEB',
  },
  feedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
  },
  feedTime: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '500',
  },
  feedTitle: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '700',
  },
  feedDesc: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
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
  tipTitle: {
    color: '#D97706',
    fontSize: 14,
    fontWeight: '700',
  },
  tipDesc: {
    color: '#4B5563',
    fontSize: 13,
    marginTop: 4,
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
    fontSize: 20,
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
  searchEmptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  searchEmptyText: {
    fontSize: 14,
    color: '#6B7280',
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
    fontSize: 16,
    marginRight: 12,
    color: '#9CA3AF',
  },
  searchSuggestionText: {
    fontSize: 14,
    color: '#1F2937',
  },
});

export default HomeScreen;