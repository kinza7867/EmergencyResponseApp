// src/screens/HistoryScreen.tsx
// Changes from original:
//   • Removed unused `width` from Dimensions (only `height` is used for modal max-height)
//   • Added useSafeAreaInsets to fix header hidden under the status bar on all devices
//   • All existing logic preserved: search, filter tabs, detail modal, animations

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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

interface SOSHistory {
  id: string;
  type: string;
  timestamp: string;
  location: string;
  status: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export const HistoryScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  const [history, setHistory] = useState<SOSHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<SOSHistory[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<SOSHistory | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    loadHistory();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadHistory = () => {
    const mockHistory: SOSHistory[] = [
      {
        id: '1',
        type: 'medical',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        location: 'Rawalpindi, Punjab',
        status: 'resolved',
        notes: 'Patient needs immediate medical attention. Difficulty breathing.',
        latitude: 33.5651,
        longitude: 73.0169,
      },
      {
        id: '2',
        type: 'police',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        location: 'Islamabad, Capital',
        status: 'pending',
        notes: 'Suspicious activity reported near the market area.',
        latitude: 33.6844,
        longitude: 73.0479,
      },
      {
        id: '3',
        type: 'fire',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        location: 'Lahore, Punjab',
        status: 'resolved',
        notes: 'Small fire in the kitchen area, now contained.',
        latitude: 31.5204,
        longitude: 74.3587,
      },
      {
        id: '4',
        type: 'accident',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        location: 'Karachi, Sindh',
        status: 'pending',
        notes: 'Car accident on main highway.',
        latitude: 24.8607,
        longitude: 67.0011,
      },
      {
        id: '5',
        type: 'other',
        timestamp: new Date(Date.now() - 345600000).toISOString(),
        location: 'Peshawar, KPK',
        status: 'resolved',
        notes: 'Request for public assistance.',
        latitude: 34.0151,
        longitude: 71.5249,
      },
    ];
    setHistory(mockHistory);
    setFilteredHistory(mockHistory);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return '✅';
      case 'pending': return '⏳';
      case 'cancelled': return '❌';
      default: return '📌';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medical': return '🚑';
      case 'fire': return '🔥';
      case 'police': return '👮';
      case 'accident': return '🚗';
      default: return '📞';
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
    setFilteredHistory(filter === 'all' ? history : history.filter(item => item.status === filter));
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') { setFilteredHistory(history); return; }
    setFilteredHistory(
      history.filter(item =>
        item.type.toLowerCase().includes(text.toLowerCase()) ||
        item.location.toLowerCase().includes(text.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(text.toLowerCase()))
      )
    );
  };

  const getFilterCount = (status: string) =>
    status === 'all' ? history.length : history.filter(item => item.status === status).length;

  const renderHistoryItem = ({ item }: { item: SOSHistory }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => { setSelectedItem(item); setModalVisible(true); }}
      activeOpacity={0.7}
    >
      <View style={styles.historyHeader}>
        <View style={styles.historyTypeContainer}>
          <Text style={styles.historyTypeIcon}>{getTypeIcon(item.type)}</Text>
          <Text style={styles.historyType}>{item.type.toUpperCase()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {getStatusIcon(item.status)} {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.historyDetails}>
        <Text style={styles.historyLocation}>📍 {item.location}</Text>
        <Text style={styles.historyTime}>🕐 {formatDate(item.timestamp)}</Text>
      </View>

      {item.notes && (
        <Text style={styles.historyNotes} numberOfLines={1}>📝 {item.notes}</Text>
      )}

      <View style={styles.historyFooter}>
        <View style={styles.idBadge}><Text style={styles.idText}>#{item.id}</Text></View>
        <Text style={styles.viewDetails}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📋 SOS History</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => navigation.navigate('RequestHistory')}>
          <Text style={styles.filterButtonText}>📊</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by type, location, or notes..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: `All (${getFilterCount('all')})` },
            { key: 'pending', label: `⏳ Pending (${getFilterCount('pending')})` },
            { key: 'resolved', label: `✅ Resolved (${getFilterCount('resolved')})` },
            { key: 'cancelled', label: `❌ Cancelled (${getFilterCount('cancelled')})` },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterTab, selectedFilter === tab.key && styles.filterTabActive]}
              onPress={() => handleFilter(tab.key)}
            >
              <Text style={[styles.filterText, selectedFilter === tab.key && styles.filterTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List or Empty State */}
      {filteredHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyTitle}>No History Found</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Try adjusting your search or filters.' : "You haven't sent any SOS alerts yet."}
          </Text>
          {searchQuery ? (
            <TouchableOpacity style={styles.clearSearchButton} onPress={() => handleSearch('')}>
              <Text style={styles.clearSearchText}>Clear Search</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.goHomeButton} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.goHomeText}>Go to Home</Text>
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
                <Text style={styles.modalTypeIcon}>
                  {selectedItem && getTypeIcon(selectedItem.type)}
                </Text>
                <Text style={styles.modalTitle}>
                  {selectedItem?.type.toUpperCase()} Alert
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalStatus}>
                  <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedItem.status) }]}>
                    <Text style={styles.modalStatusText}>
                      {getStatusIcon(selectedItem.status)}{' '}
                      {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.modalId}>ID: #{selectedItem.id}</Text>
                </View>

                <View style={styles.modalDetail}>
                  <Text style={styles.modalDetailLabel}>📍 Location</Text>
                  <Text style={styles.modalDetailValue}>{selectedItem.location}</Text>
                </View>

                <View style={styles.modalDetail}>
                  <Text style={styles.modalDetailLabel}>🕐 Date & Time</Text>
                  <Text style={styles.modalDetailValue}>{formatFullDate(selectedItem.timestamp)}</Text>
                </View>

                {selectedItem.notes && (
                  <View style={styles.modalDetail}>
                    <Text style={styles.modalDetailLabel}>📝 Notes</Text>
                    <Text style={styles.modalDetailValue}>{selectedItem.notes}</Text>
                  </View>
                )}

                {selectedItem.latitude && selectedItem.longitude && (
                  <View style={styles.modalDetail}>
                    <Text style={styles.modalDetailLabel}>📍 Coordinates</Text>
                    <Text style={styles.modalDetailValue}>
                      {selectedItem.latitude}, {selectedItem.longitude}
                    </Text>
                  </View>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.modalActionResolved]}
                    onPress={() => {
                      Alert.alert('✅ Marked as Resolved', 'This alert has been resolved.');
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalActionText}>✅ Resolved</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.modalActionCancel]}
                    onPress={() =>
                      Alert.alert('❌ Cancel Alert', 'Are you sure?', [
                        { text: 'No', style: 'cancel' },
                        { text: 'Yes', style: 'destructive' },
                      ])
                    }
                  >
                    <Text style={styles.modalActionText}>❌ Cancel</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: { padding: 4 },
  backText: { fontSize: 14, color: '#2563EB', fontWeight: '500' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  filterButton: { padding: 4 },
  filterButtonText: { fontSize: 18 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#1F2937' },
  clearIcon: { fontSize: 16, color: '#9CA3AF', padding: 4 },
  filterContainer: { paddingHorizontal: 16, marginBottom: 8 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 8 },
  filterTabActive: { backgroundColor: '#2563EB' },
  filterText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  filterTextActive: { color: '#FFFFFF' },
  listContent: { padding: 16, paddingTop: 8 },
  historyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  historyTypeContainer: { flexDirection: 'row', alignItems: 'center' },
  historyTypeIcon: { fontSize: 16, marginRight: 6 },
  historyType: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#FFFFFF', fontSize: 10, fontWeight: '500' },
  historyDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  historyLocation: { fontSize: 13, color: '#6B7280' },
  historyTime: { fontSize: 12, color: '#9CA3AF' },
  historyNotes: { fontSize: 12, color: '#6B7280', marginBottom: 8, fontStyle: 'italic' },
  historyFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  idBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  idText: { fontSize: 10, color: '#6B7280' },
  viewDetails: { fontSize: 12, color: '#2563EB', fontWeight: '500' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 16 },
  clearSearchButton: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8, paddingHorizontal: 24 },
  clearSearchText: { color: '#6B7280', fontSize: 14, fontWeight: '500' },
  goHomeButton: { backgroundColor: '#2563EB', padding: 16, borderRadius: 8, paddingHorizontal: 32 },
  goHomeText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
    maxHeight: height * 0.8,
  },
  modalHandle: { width: 40, height: 4, backgroundColor: '#D1D5DB', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  modalTypeIcon: { fontSize: 24, marginRight: 10 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  modalClose: { fontSize: 20, color: '#6B7280', padding: 4 },
  modalStatus: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalStatusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  modalStatusText: { color: '#FFFFFF', fontSize: 13, fontWeight: '500' },
  modalId: { fontSize: 12, color: '#9CA3AF' },
  modalDetail: { marginBottom: 14 },
  modalDetailLabel: { fontSize: 12, fontWeight: '500', color: '#6B7280', marginBottom: 2 },
  modalDetailValue: { fontSize: 15, color: '#1F2937' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 12 },
  modalActionButton: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center', marginHorizontal: 4 },
  modalActionResolved: { backgroundColor: '#D1FAE5' },
  modalActionCancel: { backgroundColor: '#FEE2E2' },
  modalActionText: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  modalCloseButton: { backgroundColor: '#F3F4F6', padding: 14, borderRadius: 10, alignItems: 'center' },
  modalCloseButtonText: { fontSize: 15, fontWeight: '500', color: '#6B7280' },
});