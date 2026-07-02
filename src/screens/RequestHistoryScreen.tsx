// src/screens/RequestHistoryScreen.tsx
// Week 3 — Request History screen.
// Calls GET /api/emergency?userId={id} (emergencyService.getByUser)
// Shows list of all past emergency requests with filter tabs (All, Pending, Resolved, Cancelled)
// and a search bar. Tapping a row shows a bottom-sheet detail modal.
// Loading state and empty state are both handled.

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { emergencyService, EmergencyRequest } from '../services/emergencyService';

const LOGO = require('../../assets/logo.png');
const { height, width } = Dimensions.get('window');
const isSmallDevice = height < 700;

// ── helpers ──────────────────────────────────────────────────────────────────

const TYPE_META: Record<string, { icon: string; color: string }> = {
  medical:  { icon: '🚑', color: '#DC2626' },
  fire:     { icon: '🔥', color: '#F97316' },
  police:   { icon: '👮', color: '#3B82F6' },
  accident: { icon: '🚗', color: '#7C3AED' },
  other:    { icon: '📞', color: '#6B7280' },
};

const STATUS_META: Record<string, { icon: string; color: string; bgColor: string }> = {
  pending:    { icon: '⏳', color: '#D97706', bgColor: '#FEF3C7' },
  dispatched: { icon: '🚀', color: '#DC2626', bgColor: '#FEF2F2' },
  resolved:   { icon: '✅', color: '#10B981', bgColor: '#D1FAE5' },
  cancelled:  { icon: '❌', color: '#EF4444', bgColor: '#FEE2E2' },
};

const formatRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(diff / 86_400_000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
};

const formatFull = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

// ── component ─────────────────────────────────────────────────────────────────

export const RequestHistoryScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  const [allRequests, setAllRequests]         = useState<EmergencyRequest[]>([]);
  const [filtered, setFiltered]               = useState<EmergencyRequest[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [activeFilter, setActiveFilter]       = useState<string>('all');
  const [searchQuery, setSearchQuery]         = useState('');
  const [selectedItem, setSelectedItem]       = useState<EmergencyRequest | null>(null);
  const [modalVisible, setModalVisible]       = useState(false);
  const [userId, setUserId]                   = useState('');

  // Load user ID then fetch history
  useEffect(() => {
    const init = async () => {
      try {
        const raw = await AsyncStorage.getItem('userData');
        if (raw) {
          const user = JSON.parse(raw);
          const id = user.id || 'user-1';
          const name = user.name || 'User';
          setUserId(id);
          await emergencyService.seedMockHistory(id, name);
          await fetchHistory(id);
        }
      } catch {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchHistory = async (uid: string) => {
    setLoading(true);
    try {
      const response = await emergencyService.getByUser(uid);
      const requests = response.data.requests;
      setAllRequests(requests);
      applyFilter(requests, activeFilter, searchQuery);
    } catch (error: any) {
      Alert.alert('Error', 'Could not load history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = useCallback(
    (requests: EmergencyRequest[], filter: string, query: string) => {
      let result = requests;
      if (filter !== 'all') {
        result = result.filter(r => r.status === filter);
      }
      if (query.trim()) {
        const q = query.toLowerCase();
        result = result.filter(
          r =>
            r.emergencyType.toLowerCase().includes(q) ||
            r.location.label.toLowerCase().includes(q) ||
            r.notes.toLowerCase().includes(q)
        );
      }
      setFiltered(result);
    },
    []
  );

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    applyFilter(allRequests, filter, searchQuery);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilter(allRequests, activeFilter, query);
  };

  const countByStatus = (status: string) =>
    status === 'all'
      ? allRequests.length
      : allRequests.filter(r => r.status === status).length;

  const handleCancelRequest = (item: EmergencyRequest) => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this emergency request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            await emergencyService.cancelRequest(item.id);
            setModalVisible(false);
            await fetchHistory(userId);
          },
        },
      ]
    );
  };

  // ── Render list item ────────────────────────────────────────────────────────

  const renderItem = ({ item }: { item: EmergencyRequest }) => {
    const typeMeta   = TYPE_META[item.emergencyType] || TYPE_META.other;
    const statusMeta = STATUS_META[item.status]      || STATUS_META.pending;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => { setSelectedItem(item); setModalVisible(true); }}
        activeOpacity={0.75}
      >
        <View style={styles.cardHeader}>
          <View style={styles.typeChip}>
            <Text style={styles.typeChipIcon}>{typeMeta.icon}</Text>
            <Text style={[styles.typeChipText, { color: typeMeta.color }]}>
              {item.emergencyType.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: statusMeta.bgColor }]}>
            <Text style={[styles.statusChipText, { color: statusMeta.color }]}>
              {statusMeta.icon} {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>📍 {item.location.label}</Text>
          <Text style={styles.metaTime}>🕐 {formatRelative(item.createdAt)}</Text>
        </View>

        {item.notes ? (
          <Text style={styles.notesPreview} numberOfLines={1}>📝 {item.notes}</Text>
        ) : null}

        <View style={styles.cardFooter}>
          <Text style={styles.requestId}>#{item.id.slice(0, 12).toUpperCase()}</Text>
          <Text style={styles.viewMore}>View Details →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ── Empty state ─────────────────────────────────────────────────────────────

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📭</Text>
      <Text style={styles.emptyTitle}>No Requests Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? 'Try a different search or clear the filter.'
          : 'You have no emergency requests in this category.'}
      </Text>
      {searchQuery ? (
        <TouchableOpacity style={styles.emptyAction} onPress={() => handleSearch('')}>
          <Text style={styles.emptyActionText}>Clear Search</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.emptyActionSOS}
          onPress={() => navigation.navigate('SOS')}
        >
          <LinearGradient
            colors={['#DC2626', '#B91C1C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.emptyActionGradient}
          >
            <Text style={styles.emptyActionSOSText}>🆘 Send SOS Alert</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />

      {/* Full Width Red Header with Logo - Same as HomeScreen */}
      <LinearGradient
        colors={['#DC2626', '#991B1B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fullHeader, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image source={LOGO} style={styles.headerLogo} resizeMode="contain" />
            <Text style={styles.headerTitle}>Request History</Text>
          </View>

          <TouchableOpacity onPress={() => userId && fetchHistory(userId)} style={styles.refreshButton}>
            <Text style={styles.refreshText}>↻</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search bar */}
      <View style={styles.searchRow}>
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
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {[
          { key: 'all',        label: `All (${countByStatus('all')})` },
          { key: 'pending',    label: `⏳ Pending (${countByStatus('pending')})` },
          { key: 'dispatched', label: `🚀 Dispatched (${countByStatus('dispatched')})` },
          { key: 'resolved',   label: `✅ Resolved (${countByStatus('resolved')})` },
          { key: 'cancelled',  label: `❌ Cancelled (${countByStatus('cancelled')})` },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.filterTab, activeFilter === tab.key && styles.filterTabActive]}
            onPress={() => handleFilterChange(tab.key)}
          >
            <Text style={[styles.filterTabText, activeFilter === tab.key && styles.filterTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[styles.listContent, filtered.length === 0 && styles.listEmpty]}
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
          <View style={[styles.modalSheet, { maxHeight: height * 0.82 }]}>
            <View style={styles.modalHandle} />

            {selectedItem && (() => {
              const typeMeta   = TYPE_META[selectedItem.emergencyType] || TYPE_META.other;
              const statusMeta = STATUS_META[selectedItem.status]      || STATUS_META.pending;
              return (
                <>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalTitleRow}>
                      <Text style={styles.modalTypeIcon}>{typeMeta.icon}</Text>
                      <Text style={styles.modalTitle}>
                        {selectedItem.emergencyType.toUpperCase()} ALERT
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Text style={styles.modalClose}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.modalStatusRow}>
                      <View style={[styles.statusChip, { backgroundColor: statusMeta.bgColor }]}>
                        <Text style={[styles.statusChipText, { color: statusMeta.color }]}>
                          {statusMeta.icon} {selectedItem.status.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.modalId}>#{selectedItem.id.slice(0, 12).toUpperCase()}</Text>
                    </View>

                    {[
                      { icon: '📍', label: 'Location',    value: selectedItem.location.label },
                      { icon: '🧭', label: 'Coordinates', value: `${selectedItem.location.latitude}, ${selectedItem.location.longitude}` },
                      { icon: '🕐', label: 'Submitted',   value: formatFull(selectedItem.createdAt) },
                      ...(selectedItem.notes
                        ? [{ icon: '📝', label: 'Notes', value: selectedItem.notes }]
                        : []),
                    ].map((row, i) => (
                      <View key={i} style={styles.modalDetailRow}>
                        <Text style={styles.modalDetailIcon}>{row.icon}</Text>
                        <View style={styles.modalDetailBody}>
                          <Text style={styles.modalDetailLabel}>{row.label}</Text>
                          <Text style={styles.modalDetailValue}>{row.value}</Text>
                        </View>
                      </View>
                    ))}

                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={styles.trackingBtn}
                        onPress={() => {
                          setModalVisible(false);
                          navigation.navigate('Tracking', { requestId: selectedItem.id });
                        }}
                      >
                        <Text style={styles.trackingBtnText}>📡 View Tracking</Text>
                      </TouchableOpacity>

                      {(selectedItem.status === 'pending' || selectedItem.status === 'dispatched') && (
                        <TouchableOpacity
                          style={styles.cancelBtn}
                          onPress={() => handleCancelRequest(selectedItem)}
                        >
                          <Text style={styles.cancelBtnText}>❌ Cancel Request</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.modalCloseBtn}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.modalCloseBtnText}>Close</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ── styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5' 
  },

  // Full Width Red Header - Same as HomeScreen
  fullHeader: {
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
  backText: { 
    fontSize: 15, 
    color: '#FFFFFF', 
    fontWeight: '500' 
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
    fontSize: isSmallDevice ? 15 : 17, 
    fontWeight: '700', 
    color: '#FFFFFF' 
  },
  refreshButton: { 
    padding: 4 
  },
  refreshText: { 
    fontSize: 20, 
    color: '#FFFFFF' 
  },

  // Search
  searchRow: {
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
    fontSize: 16, 
    marginRight: 8 
  },
  searchInput: { 
    flex: 1, 
    paddingVertical: 12, 
    fontSize: 14, 
    color: '#1F2937' 
  },
  searchClear: { 
    fontSize: 16, 
    color: '#9CA3AF', 
    padding: 4 
  },

  // Filter
  filterScroll: { 
    maxHeight: 44 
  },
  filterContent: { 
    paddingHorizontal: 16, 
    paddingBottom: 8 
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterTabActive: { 
    backgroundColor: '#DC2626' 
  },
  filterTabText: { 
    fontSize: 12, 
    color: '#6B7280', 
    fontWeight: '500' 
  },
  filterTabTextActive: { 
    color: '#FFFFFF' 
  },

  // Loading
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 14, 
    color: '#6B7280' 
  },

  // List
  listContent: { 
    padding: 16 
  },
  listEmpty: { 
    flexGrow: 1 
  },

  // Card
  card: {
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
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  typeChip: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  typeChipIcon: { 
    fontSize: 16, 
    marginRight: 6 
  },
  typeChipText: { 
    fontSize: 14, 
    fontWeight: '700' 
  },
  statusChip: { 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  statusChipText: { 
    fontSize: 10, 
    fontWeight: '600' 
  },
  cardMeta: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 4 
  },
  metaText: { 
    fontSize: 13, 
    color: '#6B7280' 
  },
  metaTime: { 
    fontSize: 12, 
    color: '#9CA3AF' 
  },
  notesPreview: { 
    fontSize: 12, 
    color: '#6B7280', 
    marginBottom: 8, 
    fontStyle: 'italic' 
  },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 4 
  },
  requestId: { 
    fontSize: 10, 
    color: '#9CA3AF' 
  },
  viewMore: { 
    fontSize: 12, 
    color: '#DC2626', 
    fontWeight: '600' 
  },

  // Empty
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 32 
  },
  emptyEmoji: { 
    fontSize: 64, 
    marginBottom: 16 
  },
  emptyTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#1F2937', 
    marginBottom: 4 
  },
  emptySubtitle: { 
    fontSize: 14, 
    color: '#6B7280', 
    textAlign: 'center', 
    marginBottom: 16 
  },
  emptyAction: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyActionText: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#6B7280' 
  },
  emptyActionSOS: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  emptyActionGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyActionSOSText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#FFFFFF' 
  },

  // Modal
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'flex-end' 
  },
  modalBackdrop: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.45)' 
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
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
  modalTitleRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  modalTypeIcon: { 
    fontSize: 24, 
    marginRight: 10 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1F2937' 
  },
  modalClose: { 
    fontSize: 20, 
    color: '#6B7280', 
    padding: 4 
  },
  modalStatusRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  modalId: { 
    fontSize: 12, 
    color: '#9CA3AF' 
  },
  modalDetailRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 16 
  },
  modalDetailIcon: { 
    fontSize: 18, 
    marginRight: 12, 
    marginTop: 2 
  },
  modalDetailBody: { 
    flex: 1 
  },
  modalDetailLabel: { 
    fontSize: 11, 
    fontWeight: '600', 
    color: '#9CA3AF', 
    marginBottom: 2, 
    textTransform: 'uppercase', 
    letterSpacing: 0.5 
  },
  modalDetailValue: { 
    fontSize: 15, 
    color: '#1F2937' 
  },
  modalActions: { 
    flexDirection: 'row', 
    gap: 10, 
    marginVertical: 16 
  },
  trackingBtn: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  trackingBtnText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#DC2626' 
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  cancelBtnText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#EF4444' 
  },
  modalCloseBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCloseBtnText: { 
    fontSize: 15, 
    fontWeight: '500', 
    color: '#6B7280' 
  },
});

export default RequestHistoryScreen;