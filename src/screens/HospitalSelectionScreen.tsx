// src/screens/HospitalSelectionScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { getNearbyHospitals } from "../services/hospitalService";


const LOGO = require('../../assets/logo.png');
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 380;

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance: string;
  emergency: boolean;
  rating: number;
  type: string;
}

export const HospitalSelectionScreen = ({ navigation }: any) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

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
}, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
     const currentLocation = {
  lat: location.coords.latitude,
  lng: location.coords.longitude,
};

setUserLocation(currentLocation);

// Load hospitals immediately after getting location
loadHospitals(currentLocation);

    } catch (error) {
      console.log('Location error:', error);
      setLocationError('Unable to get location');
    }
  };

 
    const loadHospitals = async (
  location?: { lat: number; lng: number }
) => {
  try {
    setLoading(true);

    const currentLocation = location || userLocation;

    if (!currentLocation) {
      return;
    }

   const response = await getNearbyHospitals(
  currentLocation.lat,
  currentLocation.lng
);

console.log("========== API RESPONSE ==========");
console.log(JSON.stringify(response, null, 2));
console.log("==================================");

console.log("Response Success:", response.success);
console.log("Hospital Count:", response.data?.length);

    if (response.success) {
      const hospitals = response.data.map((item: any) => ({
        id: item._id,
        name: item.name,
        address: item.address,
        phone: item.phone,
        latitude: item.latitude,
        longitude: item.longitude,
        distance: `${item.distance} km`,
        emergency: item.isAvailable,
        rating: 4.8,
        type: "General",
      }));

      setHospitals(hospitals);
      setFilteredHospitals(hospitals);
    }

  } catch (error) {
    console.log("Hospital Error:", error);

    Alert.alert(
      "Error",
      "Unable to load nearby hospitals."
    );

  } finally {
    setLoading(false);
  }
};
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterHospitals(query, selectedFilter);
  };

  const filterHospitals = (query: string, filter: string) => {
    let filtered = hospitals;

    // Search filter
    if (query.trim()) {
      filtered = filtered.filter(h =>
        h.name.toLowerCase().includes(query.toLowerCase()) ||
        h.address.toLowerCase().includes(query.toLowerCase()) ||
        h.type.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Type filter
    if (filter !== 'all') {
      filtered = filtered.filter(h => 
        filter === 'emergency' ? h.emergency : h.type.toLowerCase() === filter.toLowerCase()
      );
    }

    setFilteredHospitals(filtered);
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    filterHospitals(searchQuery, filter);
    Vibration.vibrate(20);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await getUserLocation();
    loadHospitals();
    setRefreshing(false);
  };

  const handleHospitalPress = (hospital: Hospital) => {
    Vibration.vibrate(30);
    Alert.alert(
      hospital.name,
      `${hospital.address}\n\n📞 ${hospital.phone}\n⭐ ${hospital.rating} / 5.0\n🚑 ${hospital.emergency ? 'Emergency Services Available' : 'No Emergency Services'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: '📞 Call',
          onPress: () => {
            const phoneNumber = Platform.OS === 'android' ? `tel:${hospital.phone}` : `telprompt:${hospital.phone}`;
            Linking.openURL(phoneNumber).catch(() => {
              Alert.alert('Error', 'Unable to make call.');
            });
          }
        },
        {
          text: '📍 Navigate',
          onPress: () => {
            const url = Platform.OS === 'ios'
              ? `http://maps.apple.com/?q=${hospital.name}`
              : `https://www.google.com/maps/search/?api=1&query=${hospital.name}`;
            Linking.openURL(url).catch(() => {
              Alert.alert('Error', 'Unable to open maps.');
            });
          }
        },
      ]
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={`star-${i}`} name="star" size={14} color="#F59E0B" />);
    }
    if (hasHalfStar) {
      stars.push(<Ionicons key="half-star" name="star-half" size={14} color="#F59E0B" />);
    }
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Ionicons key={`empty-star-${i}`} name="star-outline" size={14} color="#D1D5DB" />);
    }
    return stars;
  };

  const getFilterLabel = (filter: string) => {
    switch(filter) {
      case 'all': return 'All';
      case 'emergency': return '🚑 Emergency';
      case 'general': return 'General';
      case 'pediatric': return 'Pediatric';
      case 'cardiac': return 'Cardiac';
      case 'maternity': return 'Maternity';
      case 'trauma': return 'Trauma';
      default: return filter;
    }
  };

  const filters = ['all', 'emergency', 'general', 'pediatric', 'cardiac', 'maternity', 'trauma'];

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
            <Text style={styles.headerTitle}>Hospitals</Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSelectedFilter('all');
              setFilteredHospitals(hospitals);
              Vibration.vibrate(20);
            }}
            activeOpacity={0.7}
            style={styles.resetButton}
          >
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search hospitals by name, type or location..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => handleSearch('')}
                activeOpacity={0.7}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  selectedFilter === filter && styles.filterChipActive,
                ]}
                onPress={() => handleFilterSelect(filter)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === filter && styles.filterChipTextActive,
                  ]}
                >
                  {getFilterLabel(filter)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results Count */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            {filteredHospitals.length} hospital{filteredHospitals.length !== 1 ? 's' : ''} found
          </Text>
          {locationError && (
            <Text style={styles.locationErrorText}>
              <Ionicons name="warning" size={14} color="#F59E0B" /> {locationError}
            </Text>
          )}
        </View>

        {/* Hospital List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#DC2626" />
            <Text style={styles.loadingText}>Finding hospitals near you...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredHospitals}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <Animated.View
                style={[
                  styles.hospitalCard,
                  {
                    opacity: fadeAnim,
                    transform: [{
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20 * (index + 1), 0],
                      })
                    }],
                  }
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleHospitalPress(item)}
                  activeOpacity={0.8}
                  style={styles.hospitalCardTouchable}
                >
                  <View style={styles.hospitalCardHeader}>
                    <View style={styles.hospitalIconContainer}>
                      <Ionicons name="business" size={24} color="#DC2626" />
                    </View>
                    <View style={styles.hospitalInfo}>
                      <Text style={styles.hospitalName}>{item.name}</Text>
                      <View style={styles.hospitalRating}>
                        {renderStars(item.rating)}
                        <Text style={styles.hospitalRatingText}>{item.rating}</Text>
                      </View>
                    </View>
                    {item.emergency && (
                      <View style={styles.emergencyBadge}>
                        <Text style={styles.emergencyBadgeText}>EMERGENCY</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.hospitalCardBody}>
                    <View style={styles.hospitalDetail}>
                      <Ionicons name="location" size={16} color="#6B7280" />
                      <Text style={styles.hospitalAddress}>{item.address}</Text>
                    </View>
                    <View style={styles.hospitalDetail}>
                      <Ionicons name="call" size={16} color="#6B7280" />
                      <Text style={styles.hospitalPhone}>{item.phone}</Text>
                    </View>
                    <View style={styles.hospitalDetail}>
                      <Ionicons name="time" size={16} color="#6B7280" />
                      <Text style={styles.hospitalDistance}>
                        {item.distance} away • {item.type}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.hospitalCardFooter}>
                    <TouchableOpacity
                      style={[styles.hospitalActionButton, styles.callButton]}
                      onPress={() => {
                        const phoneNumber = Platform.OS === 'android' ? `tel:${item.phone}` : `telprompt:${item.phone}`;
                        Linking.openURL(phoneNumber).catch(() => {
                          Alert.alert('Error', 'Unable to make call.');
                        });
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="call" size={18} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.hospitalActionButton, styles.navigateButton]}
                      onPress={() => {
                        const url = Platform.OS === 'ios'
                          ? `http://maps.apple.com/?q=${item.name}`
                          : `https://www.google.com/maps/search/?api=1&query=${item.name}`;
                        Linking.openURL(url).catch(() => {
                          Alert.alert('Error', 'Unable to open maps.');
                        });
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="navigate" size={18} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Navigate</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#DC2626']}
                tintColor="#DC2626"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="business-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No Hospitals Found</Text>
                <Text style={styles.emptySubtitle}>
                  Try adjusting your search or filter criteria
                </Text>
                <TouchableOpacity
                  style={styles.resetSearchButton}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedFilter('all');
                    setFilteredHospitals(hospitals);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resetSearchButtonText}>Reset Search</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
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
    paddingHorizontal: 16,
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
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resetButton: {
    padding: 4,
  },

  // Search
  searchContainer: {
    marginTop: 16,
    marginBottom: 12,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: isSmallDevice ? 10 : 12,
    fontSize: isSmallDevice ? 14 : 15,
    color: '#1F2937',
  },
  clearButton: {
    padding: 4,
  },

  // Filters
  filterContainer: {
    marginBottom: 12,
  },
  filterScrollContent: {
    paddingHorizontal: 2,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  filterChipText: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },

  // Results
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsText: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  locationErrorText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#F59E0B',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },

  // List
  listContent: {
    paddingBottom: 80,
  },

  // Hospital Card
  hospitalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  hospitalCardTouchable: {
    padding: 14,
  },
  hospitalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  hospitalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  hospitalRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  hospitalRatingText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  emergencyBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  emergencyBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#DC2626',
  },

  hospitalCardBody: {
    marginBottom: 12,
  },
  hospitalDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  hospitalAddress: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#4B5563',
    marginLeft: 8,
    flex: 1,
  },
  hospitalPhone: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#4B5563',
    marginLeft: 8,
  },
  hospitalDistance: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#4B5563',
    marginLeft: 8,
  },

  hospitalCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  hospitalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  callButton: {
    backgroundColor: '#DC2626',
  },
  navigateButton: {
    backgroundColor: '#3B82F6',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  resetSearchButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },
  resetSearchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HospitalSelectionScreen;