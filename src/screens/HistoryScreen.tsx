// src/screens/HistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
  StatusBar,
  Platform,
  Image,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGO = require('../../assets/logo.png');
const { height, width } = Dimensions.get('window');
const isSmallDevice = height < 700;

interface SOSHistory {
  id: string;
  type: string;
  timestamp: string;
  location: string;
  status: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  responder?: string;
  responderPhone?: string;
}

export const HistoryScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  const [history, setHistory] = useState<SOSHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<SOSHistory[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<SOSHistory | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    loadHistory();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem('sosHistory');
      if (saved) {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
        setFilteredHistory(parsed);
        return;
      }
    } catch (error) {
      console.log('Error loading history:', error);
    }

    // Mock data
    const mockHistory: SOSHistory[] = [
      {
        id: '1',
        type: 'medical',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        location: 'Rawalpindi, Punjab',
        status: 'resolved',
        notes: 'Patient needed immediate medical attention. Difficulty breathing. Responder arrived within 5 minutes.',
        latitude: 33.5651,
        longitude: 73.0169,
        responder: 'Dr. Ahmed Khan',
        responderPhone: '+92-300-1234567',
      },
      {
        id: '2',
        type: 'police',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        location: 'Islamabad, Capital',
        status: 'pending',
        notes: 'Suspicious activity reported near the market area. Police dispatched.',
        latitude: 33.6844,
        longitude: 73.0479,
        responder: 'Inspector Ali',
        responderPhone: '+92-300-7654321',
      },
      {
        id: '3',
        type: 'fire',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        location: 'Lahore, Punjab',
        status: 'resolved',
        notes: 'Small fire in the kitchen area, now contained. Fire brigade responded quickly.',
        latitude: 31.5204,
        longitude: 74.3587,
        responder: 'Fire Captain Usman',
        responderPhone: '+92-300-9876543',
      },
      {
        id: '4',
        type: 'accident',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        location: 'Karachi, Sindh',
        status: 'pending',
        notes: 'Car accident on main highway. Rescue team en route.',
        latitude: 24.8607,
        longitude: 67.0011,
        responder: 'Rescue Team Leader',
        responderPhone: '+92-300-4567890',
      },
      {
        id: '5',
        type: 'other',
        timestamp: new Date(Date.now() - 345600000).toISOString(),
        location: 'Peshawar, KPK',
        status: 'resolved',
        notes: 'Request for public assistance. Situation resolved.',
        latitude: 34.0151,
        longitude: 71.5249,
        responder: 'Social Worker',
        responderPhone: '+92-300-2345678',
      },
    ];
    setHistory(mockHistory);
    setFilteredHistory(mockHistory);
    await AsyncStorage.setItem('sosHistory', JSON.stringify(mockHistory));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'resolved': return '#D1FAE5';
      case 'pending': return '#FEF3C7';
      case 'cancelled': return '#FEE2E2';
      default: return '#F3F4F6';
    }
  };

  const getStatusIconName = (status: string): any => {
    switch (status) {
      case 'resolved': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'cancelled': return 'close-circle';
      default: return 'alert-circle';
    }
  };

  const getTypeIconName = (type: string): any => {
    switch (type) {
      case 'medical': return 'medical';
      case 'fire': return 'flame';
      case 'police': return 'shield';
      case 'accident': return 'car';
      default: return 'alert-circle';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'medical': return '#DC2626';
      case 'fire': return '#F97316';
      case 'police': return '#3B82F6';
      case 'accident': return '#7C3AED';
      default: return '#6B7280';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatFullDate = (timestamp: string) =>
    new Date(timestamp).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const handleFilter = (filter: string) => {
    setSelectedFilter(filter);
    if (filter === 'all') {
      setFilteredHistory(history);
    } else {
      setFilteredHistory(history.filter(item => item.status === filter));
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      handleFilter(selectedFilter);
      return;
    }
    const filtered = history.filter(item =>
      item.type.toLowerCase().includes(text.toLowerCase()) ||
      item.location.toLowerCase().includes(text.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(text.toLowerCase())) ||
      (item.responder && item.responder.toLowerCase().includes(text.toLowerCase()))
    );
    setFilteredHistory(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const getFilterCount = (status: string) =>
    status === 'all' ? history.length : history.filter(item => item.status === status).length;

  const updateHistoryStatus = async (id: string, newStatus: string) => {
    const updated = history.map(item =>
      item.id === id ? { ...item, status: newStatus } : item
    );
    setHistory(updated);
    setFilteredHistory(updated);
    await AsyncStorage.setItem('sosHistory', JSON.stringify(updated));
  };

  const renderHistoryItem = ({ item }: { item: SOSHistory }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => { setSelectedItem(item); setModalVisible(true); }}
      activeOpacity={0.7}
    >
      <View style={styles.historyHeader}>
        <View style={styles.historyTypeContainer}>
          <View style={[styles.typeIconContainer, { backgroundColor: getTypeColor(item.type) + '20' }]}>
            <Ionicons name={getTypeIconName(item.type)} size={16} color={getTypeColor(item.type)} />
          </View>
          <Text style={[styles.historyType, { color: getTypeColor(item.type) }]}>
            {item.type.toUpperCase()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(item.status) }]}>
          <Ionicons name={getStatusIconName(item.status)} size={12} color={getStatusColor(item.status)} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.historyDetails}>
        <View style={styles.historyLocationContainer}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.historyLocation} numberOfLines={1}>{item.location}</Text>
        </View>
        <View style={styles.historyTimeContainer}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.historyTime}>{formatDate(item.timestamp)}</Text>
        </View>
      </View>

      {item.notes ? (
        <View style={styles.historyNotesContainer}>
          <Ionicons name="document-text-outline" size={14} color="#6B7280" />
          <Text style={styles.historyNotes} numberOfLines={1}>{item.notes}</Text>
        </View>
      ) : null}

      {item.responder ? (
        <View style={styles.responderContainer}>
          <Ionicons name="person-outline" size={12} color="#6B7280" />
          <Text style={styles.responderText}>{item.responder}</Text>
        </View>
      ) : null}

      <View style={styles.historyFooter}>
        <View style={styles.idBadge}>
          <Text style={styles.idText}>#{item.id}</Text>
        </View>
        <View style={styles.viewDetailsContainer}>
          <Text style={styles.viewDetails}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color="#DC2626" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
      
      {/* Full Width Red Header with Logo */}
      <LinearGradient
        colors={['#DC2626', '#991B1B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fullHeader, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image source={LOGO} style={styles.headerLogo} resizeMode="contain" />
            <Text style={styles.headerTitle}>SOS History</Text>
          </View>

          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={() => navigation.navigate('RequestHistory')}
            activeOpacity={0.7}
          >
            <Ionicons name="list-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by type, location, or notes..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 ? (
          <TouchableOpacity onPress={() => handleSearch('')} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {[
            { key: 'all', label: 'All', icon: 'list' },
            { key: 'pending', label: 'Pending', icon: 'time' },
            { key: 'resolved', label: 'Resolved', icon: 'checkmark-circle' },
            { key: 'cancelled', label: 'Cancelled', icon: 'close-circle' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.filterTab, 
                selectedFilter === tab.key ? styles.filterTabActive : null
              ]}
              onPress={() => handleFilter(tab.key)}
              activeOpacity={0.7}
            >
              <View style={styles.filterTabContent}>
                <Ionicons 
                  name={tab.icon as any} 
                  size={14} 
                  color={selectedFilter === tab.key ? '#FFFFFF' : '#6B7280'} 
                />
                <Text style={[
                  styles.filterText, 
                  selectedFilter === tab.key ? styles.filterTextActive : null
                ]}>
                  {tab.label}
                </Text>
                <View style={[
                  styles.filterCount,
                  selectedFilter === tab.key ? styles.filterCountActive : null
                ]}>
                  <Text style={[
                    styles.filterCountText,
                    selectedFilter === tab.key ? styles.filterCountTextActive : null
                  ]}>
                    {getFilterCount(tab.key)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List or Empty State */}
      {filteredHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No History Found</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Try adjusting your search or filters.' : "You haven't sent any SOS alerts yet."}
          </Text>
          {searchQuery ? (
            <TouchableOpacity style={styles.clearSearchButton} onPress={() => handleSearch('')} activeOpacity={0.7}>
              <Text style={styles.clearSearchText}>Clear Search</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.goHomeButton} onPress={() => navigation.navigate('Home')} activeOpacity={0.8}>
              <LinearGradient
                colors={['#DC2626', '#B91C1C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.goHomeGradient}
              >
                <Ionicons name="home-outline" size={20} color="#FFFFFF" />
                <Text style={styles.goHomeText}>Go to Home</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#DC2626']}
              tintColor="#DC2626"
            />
          }
        />
      )}

      {/* Detail Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View style={[styles.modalTypeIconContainer, { backgroundColor: selectedItem ? getTypeColor(selectedItem.type) + '20' : '#F3F4F6' }]}>
                  <Ionicons 
                    name={selectedItem ? getTypeIconName(selectedItem.type) : 'alert-circle'} 
                    size={24} 
                    color={selectedItem ? getTypeColor(selectedItem.type) : '#6B7280'} 
                  />
                </View>
                <Text style={styles.modalTitle}>
                  {selectedItem?.type.toUpperCase()} Alert
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedItem ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalStatus}>
                  <View style={[styles.modalStatusBadge, { backgroundColor: getStatusBgColor(selectedItem.status) }]}>
                    <Ionicons name={getStatusIconName(selectedItem.status)} size={16} color={getStatusColor(selectedItem.status)} />
                    <Text style={[styles.modalStatusText, { color: getStatusColor(selectedItem.status) }]}>
                      {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.modalId}>ID: #{selectedItem.id}</Text>
                </View>

                <View style={styles.modalDetail}>
                  <Text style={styles.modalDetailLabel}>
                    Location
                  </Text>
                  <Text style={styles.modalDetailValue}>{selectedItem.location}</Text>
                </View>

                <View style={styles.modalDetail}>
                  <Text style={styles.modalDetailLabel}>
                    Date & Time
                  </Text>
                  <Text style={styles.modalDetailValue}>{formatFullDate(selectedItem.timestamp)}</Text>
                </View>

                {selectedItem.responder ? (
                  <View style={styles.modalDetail}>
                    <Text style={styles.modalDetailLabel}>
                      Responder
                    </Text>
                    <Text style={styles.modalDetailValue}>{selectedItem.responder}</Text>
                    {selectedItem.responderPhone ? (
                      <Text style={styles.modalDetailValue}>{selectedItem.responderPhone}</Text>
                    ) : null}
                  </View>
                ) : null}

                {selectedItem.notes ? (
                  <View style={styles.modalDetail}>
                    <Text style={styles.modalDetailLabel}>
                      Notes
                    </Text>
                    <Text style={styles.modalDetailValue}>{selectedItem.notes}</Text>
                  </View>
                ) : null}

                {selectedItem.latitude && selectedItem.longitude ? (
                  <View style={styles.modalDetail}>
                    <Text style={styles.modalDetailLabel}>
                      Coordinates
                    </Text>
                    <Text style={styles.modalDetailValue}>
                      {selectedItem.latitude.toFixed(4)}, {selectedItem.longitude.toFixed(4)}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.modalActions}>
                  {selectedItem.status !== 'resolved' ? (
                    <TouchableOpacity
                      style={[styles.modalActionButton, styles.modalActionResolved]}
                      onPress={() => {
                        Alert.alert(
                          'Mark as Resolved',
                          'Mark this alert as resolved?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                              text: 'Resolve', 
                              onPress: async () => {
                                await updateHistoryStatus(selectedItem.id, 'resolved');
                                setModalVisible(false);
                                Alert.alert('Success', 'Alert marked as resolved.');
                              }
                            }
                          ]
                        );
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                      <Text style={[styles.modalActionText, { color: '#10B981' }]}>Resolve</Text>
                    </TouchableOpacity>
                  ) : null}
                  
                  {selectedItem.status !== 'cancelled' ? (
                    <TouchableOpacity
                      style={[styles.modalActionButton, styles.modalActionCancel]}
                      onPress={() => {
                        Alert.alert(
                          'Cancel Alert',
                          'Are you sure you want to cancel this alert?',
                          [
                            { text: 'No', style: 'cancel' },
                            { 
                              text: 'Yes', 
                              style: 'destructive',
                              onPress: async () => {
                                await updateHistoryStatus(selectedItem.id, 'cancelled');
                                setModalVisible(false);
                                Alert.alert('Success', 'Alert cancelled.');
                              }
                            }
                          ]
                        );
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                      <Text style={[styles.modalActionText, { color: '#EF4444' }]}>Cancel</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5' 
  },

  // Full Width Red Header with Logo
  fullHeader: {
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: '#FFFFFF' 
  },
  filterButton: { 
    padding: 4 
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: { 
    marginRight: 8 
  },
  searchInput: { 
    flex: 1, 
    paddingVertical: 12, 
    fontSize: 14, 
    color: '#1F2937' 
  },

  // Filter Tabs
  filterContainer: { 
    paddingHorizontal: 16, 
    marginBottom: 8 
  },
  filterScrollContent: {
    gap: 8,
  },
  filterTab: { 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: '#F3F4F6', 
  },
  filterTabActive: { 
    backgroundColor: '#DC2626' 
  },
  filterTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterText: { 
    fontSize: 12, 
    color: '#6B7280', 
    fontWeight: '500' 
  },
  filterTextActive: { 
    color: '#FFFFFF' 
  },
  filterCount: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
  },
  filterCountActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterCountText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  filterCountTextActive: {
    color: '#FFFFFF',
  },

  // List
  listContent: { 
    padding: 16, 
    paddingTop: 8 
  },
  historyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  historyTypeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 6,
  },
  typeIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyType: { 
    fontSize: 13, 
    fontWeight: '700' 
  },
  statusBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 12,
    gap: 4,
  },
  statusText: { 
    fontSize: 10, 
    fontWeight: '600' 
  },
  historyDetails: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  historyLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  historyLocation: { 
    fontSize: 13, 
    color: '#6B7280',
    flex: 1,
  },
  historyTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyTime: { 
    fontSize: 12, 
    color: '#9CA3AF' 
  },
  historyNotesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  historyNotes: { 
    fontSize: 12, 
    color: '#6B7280', 
    flex: 1,
    fontStyle: 'italic' 
  },
  responderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  responderText: {
    fontSize: 11,
    color: '#6B7280',
  },
  historyFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 4 
  },
  idBadge: { 
    backgroundColor: '#F3F4F6', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 4 
  },
  idText: { 
    fontSize: 10, 
    color: '#6B7280' 
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetails: { 
    fontSize: 12, 
    color: '#DC2626', 
    fontWeight: '600' 
  },

  // Empty State
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 32 
  },
  emptyTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#1F2937', 
    marginTop: 16,
    marginBottom: 4 
  },
  emptyText: { 
    fontSize: 14, 
    color: '#6B7280', 
    textAlign: 'center', 
    marginBottom: 16 
  },
  clearSearchButton: { 
    backgroundColor: '#F3F4F6', 
    padding: 12, 
    borderRadius: 8, 
    paddingHorizontal: 24 
  },
  clearSearchText: { 
    color: '#6B7280', 
    fontSize: 14, 
    fontWeight: '500' 
  },
  goHomeButton: { 
    borderRadius: 8, 
    overflow: 'hidden' 
  },
  goHomeGradient: { 
    flexDirection: 'row',
    paddingVertical: 12, 
    paddingHorizontal: 32, 
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  goHomeText: { 
    color: '#FFFFFF', 
    fontSize: 14, 
    fontWeight: '600' 
  },

  // Modal
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'flex-end' 
  },
  modalBackdrop: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.4)' 
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
    maxHeight: height * 0.85,
  },
  modalHandle: { 
    width: 40, 
    height: 4, 
    backgroundColor: '#D1D5DB', 
    borderRadius: 2, 
    alignSelf: 'center', 
    marginBottom: 16 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  modalTitleContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 10,
  },
  modalTypeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1F2937' 
  },
  modalStatus: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  modalStatusBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20,
    gap: 6,
  },
  modalStatusText: { 
    fontSize: 13, 
    fontWeight: '600' 
  },
  modalId: { 
    fontSize: 12, 
    color: '#9CA3AF' 
  },
  modalDetail: { 
    marginBottom: 14 
  },
  modalDetailLabel: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#6B7280', 
    marginBottom: 2 
  },
  modalDetailValue: { 
    fontSize: 14, 
    color: '#1F2937' 
  },
  modalActions: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 8, 
    marginBottom: 12,
    gap: 8,
  },
  modalActionButton: { 
    flex: 1, 
    padding: 12, 
    borderRadius: 10, 
    alignItems: 'center', 
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  modalActionResolved: { 
    backgroundColor: '#D1FAE5' 
  },
  modalActionCancel: { 
    backgroundColor: '#FEE2E2' 
  },
  modalActionText: { 
    fontSize: 14, 
    fontWeight: '500' 
  },
  modalCloseButton: { 
    backgroundColor: '#F3F4F6', 
    padding: 14, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  modalCloseButtonText: { 
    fontSize: 15, 
    fontWeight: '500', 
    color: '#6B7280' 
  },
});

export default HistoryScreen;