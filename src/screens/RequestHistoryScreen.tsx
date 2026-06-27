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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { emergencyService, EmergencyRequest } from '../services/emergencyService';
import { colors, spacing, borderRadius, fontSizes, fontWeights, shadows } from '../styles/theme';

const { height } = Dimensions.get('window');

// ── helpers ──────────────────────────────────────────────────────────────────

const TYPE_META: Record<string, { icon: string; color: string }> = {
  medical:  { icon: '🚑', color: colors.danger },
  fire:     { icon: '🔥', color: colors.fire },
  police:   { icon: '👮', color: colors.police },
  accident: { icon: '🚗', color: colors.accident },
  other:    { icon: '📞', color: colors.textSecondary },
};

const STATUS_META: Record<string, { icon: string; color: string; bgColor: string }> = {
  pending:    { icon: '⏳', color: '#D97706', bgColor: colors.warningBg },
  dispatched: { icon: '🚀', color: colors.primary, bgColor: colors.primaryBg },
  resolved:   { icon: '✅', color: colors.success, bgColor: colors.successBg },
  cancelled:  { icon: '❌', color: colors.danger,  bgColor: colors.dangerBg },
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
          // Seed mock data so the list is not empty on first launch
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
        {/* Card header */}
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

        {/* Location + time */}
        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>📍 {item.location.label}</Text>
          <Text style={styles.metaTime}>🕐 {formatRelative(item.createdAt)}</Text>
        </View>

        {/* Notes preview */}
        {item.notes ? (
          <Text style={styles.notesPreview} numberOfLines={1}>📝 {item.notes}</Text>
        ) : null}

        {/* Footer */}
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
          style={[styles.emptyAction, { backgroundColor: colors.danger }]}
          onPress={() => navigation.navigate('SOS')}
        >
          <Text style={[styles.emptyActionText, { color: colors.textWhite }]}>
            🆘 Send SOS Alert
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.card} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📋 Request History</Text>
        <TouchableOpacity onPress={() => userId && fetchHistory(userId)} style={styles.refreshBtn}>
          <Text style={styles.refreshBtnText}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by type, location, or notes..."
          placeholderTextColor={colors.textPlaceholder}
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
          <ActivityIndicator size="large" color={colors.primary} />
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
                  {/* Modal header */}
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
                    {/* Status row */}
                    <View style={styles.modalStatusRow}>
                      <View style={[styles.statusChip, { backgroundColor: statusMeta.bgColor }]}>
                        <Text style={[styles.statusChipText, { color: statusMeta.color }]}>
                          {statusMeta.icon} {selectedItem.status.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.modalId}>#{selectedItem.id.slice(0, 12).toUpperCase()}</Text>
                    </View>

                    {/* Detail rows */}
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

                    {/* Actions */}
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
    </SafeAreaView>
  );
};

// ── styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.sm,
  },
  backBtn: { padding: spacing.xs },
  backBtnText: { fontSize: fontSizes.md, color: colors.primary, fontWeight: fontWeights.medium },
  headerTitle: { fontSize: fontSizes.xl, fontWeight: fontWeights.bold, color: colors.textHeading },
  refreshBtn: { padding: spacing.xs },
  refreshBtnText: { fontSize: 20, color: colors.primary },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    margin: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: { flex: 1, paddingVertical: spacing.md, fontSize: fontSizes.md, color: colors.textPrimary },
  searchClear: { fontSize: 16, color: colors.textMuted, padding: spacing.xs },

  filterScroll: { maxHeight: 44 },
  filterContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  filterTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.borderLight,
    marginRight: spacing.sm,
  },
  filterTabActive: { backgroundColor: colors.primary },
  filterTabText: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: fontWeights.medium },
  filterTabTextActive: { color: colors.textWhite },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: spacing.md, fontSize: fontSizes.md, color: colors.textSecondary },

  listContent: { padding: spacing.lg },
  listEmpty: { flexGrow: 1 },

  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  typeChip: { flexDirection: 'row', alignItems: 'center' },
  typeChipIcon: { fontSize: 16, marginRight: spacing.xs },
  typeChipText: { fontSize: fontSizes.sm, fontWeight: fontWeights.bold },
  statusChip: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.sm },
  statusChipText: { fontSize: fontSizes.xs, fontWeight: fontWeights.semibold },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  metaText: { fontSize: fontSizes.sm, color: colors.textSecondary },
  metaTime: { fontSize: fontSizes.xs, color: colors.textMuted },
  notesPreview: { fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.sm, fontStyle: 'italic' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  requestId: { fontSize: fontSizes.xs, color: colors.textMuted },
  viewMore: { fontSize: fontSizes.sm, color: colors.primary, fontWeight: fontWeights.medium },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxxl },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.lg },
  emptyTitle: { fontSize: fontSizes.xxl, fontWeight: fontWeights.bold, color: colors.textHeading, marginBottom: spacing.sm },
  emptySubtitle: { fontSize: fontSizes.md, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  emptyAction: {
    backgroundColor: colors.borderLight,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  emptyActionText: { fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.textPrimary },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  modalHandle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center' },
  modalTypeIcon: { fontSize: 24, marginRight: spacing.sm },
  modalTitle: { fontSize: fontSizes.xl, fontWeight: fontWeights.bold, color: colors.textHeading },
  modalClose: { fontSize: 20, color: colors.textSecondary, padding: spacing.xs },
  modalStatusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  modalId: { fontSize: fontSizes.xs, color: colors.textMuted },
  modalDetailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.lg },
  modalDetailIcon: { fontSize: 18, marginRight: spacing.md, marginTop: 2 },
  modalDetailBody: { flex: 1 },
  modalDetailLabel: { fontSize: fontSizes.xs, fontWeight: fontWeights.semibold, color: colors.textMuted, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  modalDetailValue: { fontSize: fontSizes.md, color: colors.textPrimary },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.lg },
  trackingBtn: {
    flex: 1,
    backgroundColor: colors.primaryBg,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  trackingBtnText: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.primary },
  cancelBtn: {
    flex: 1,
    backgroundColor: colors.dangerBg,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.danger },
  modalCloseBtn: {
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  modalCloseBtnText: { fontSize: fontSizes.md, fontWeight: fontWeights.medium, color: colors.textSecondary },
});
