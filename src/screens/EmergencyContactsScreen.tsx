// src/screens/EmergencyContactsScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
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
import {
  addEmergencyContact,
  deleteEmergencyContact,
  getEmergencyContacts
} from "../services/emergencyContactService";

const LOGO = require('../../assets/logo.png');
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 380;

interface EmergencyContact {
  _id: string;
  name: string;
  phone: string;
  relationship: string;
  isEmergency: boolean;
  photo?: string;
}

export const EmergencyContactsScreen = ({ navigation }: any) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<EmergencyContact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',
    isEmergency: false,
  });

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

    loadContacts();
  }, []);

 const loadContacts = async () => {
  try {
    setLoading(true);

    const response = await getEmergencyContacts();

    if (response.success) {
      setContacts(response.data);
    }

  } catch (error) {
    console.log(error)

    Alert.alert(
      "Error",
      "Unable to load emergency contacts."
    );

  } finally {
    setLoading(false);
  }
};

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadContacts();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterContacts(query, selectedFilter);
  };

  const filterContacts = (query: string, filter: string) => {
    let filtered = contacts;

    if (query.trim()) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.includes(query) ||
        c.relationship.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (filter === 'emergency') {
      filtered = filtered.filter(c => c.isEmergency);
    }

    setFilteredContacts(filtered);
  };

  const handleFilterSelect = (filter: string) => {
    Vibration.vibrate(20);
    setSelectedFilter(filter);
    filterContacts(searchQuery, filter);
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      phone: '',
      relationship: '',
      isEmergency: false,
    });
    setModalVisible(true);
    Vibration.vibrate(20);
  };
const handleSaveContact = async () => {
  if (
    !formData.name.trim() ||
    !formData.phone.trim() ||
    !formData.relationship.trim()
  ) {
    Alert.alert("Error", "Please fill in all fields.");
    return;
  }

  try {
    const response = await addEmergencyContact({
      name: formData.name,
      phone: formData.phone,
      relationship: formData.relationship,
    });

    if (response.success) {
      Alert.alert("Success", "Emergency contact added successfully.");

      setModalVisible(false);

      setFormData({
        name: "",
        phone: "",
        relationship: "",
        isEmergency: false,
      });

      loadContacts();
    }
  } catch (error) {
    console.log(error);

    Alert.alert(
      "Error",
      "Unable to add emergency contact."
    );
  }
};
  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      isEmergency: contact.isEmergency,
    });
    setModalVisible(true);
    Vibration.vibrate(20);
  };

  const handleDelete = async (id: string) => {
  try {
    await deleteEmergencyContact(id);

    Alert.alert(
      "Success",
      "Contact deleted successfully."
    );

    loadContacts();

  } catch (error) {
    console.log(error);

    Alert.alert(
      "Error",
      "Unable to delete contact."
    );
  }
};

  const handleMakeEmergencyCall = (phone: string) => {
    Vibration.vibrate(30);
    Alert.alert(
      'Emergency Call',
      `Call ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          style: 'destructive',
          onPress: () => {
            const phoneNumber = Platform.OS === 'android' ? `tel:${phone}` : `telprompt:${phone}`;
            Linking.openURL(phoneNumber).catch(() => {
              Alert.alert('Error', 'Unable to make call. Please dial manually.');
            });
          }
        }
      ]
    );
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

  const renderContactItem = ({ item, index }: { item: EmergencyContact; index: number }) => (
    <Animated.View
      style={[
        styles.contactCard,
        item.isEmergency && styles.contactCardEmergency,
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
        style={styles.contactTouchable}
        onPress={() => handleEditContact(item)}
        activeOpacity={0.7}
      >
        <View style={styles.contactLeft}>
          <View style={[styles.contactAvatar, { backgroundColor: getRandomColor(item.name) }]}>
            <Text style={styles.contactAvatarText}>{getInitials(item.name)}</Text>
          </View>
          <View style={styles.contactInfo}>
            <View style={styles.contactNameRow}>
              <Text style={styles.contactName}>{item.name}</Text>
              {item.isEmergency && (
                <View style={styles.emergencyBadge}>
                  <Text style={styles.emergencyBadgeText}>EMERGENCY</Text>
                </View>
              )}
            </View>
            <Text style={styles.contactPhone}>{item.phone}</Text>
            <Text style={styles.contactRelationship}>{item.relationship}</Text>
          </View>
        </View>
        <View style={styles.contactRight}>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleMakeEmergencyCall(item.phone)}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item._id)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'emergency', label: 'Emergency' },
  ];

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
            <Text style={styles.headerTitle}>Emergency Contacts</Text>
          </View>

          <TouchableOpacity
            onPress={handleAddContact}
            activeOpacity={0.7}
            style={styles.addButton}
          >
            <Ionicons name="add" size={32} color="#FFFFFF" />
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
              placeholder="Search contacts..."
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

        {/* Filters */}
        <View style={styles.filterContainer}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.filterChipActive,
              ]}
              onPress={() => handleFilterSelect(filter.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === filter.id && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
                {filter.id === 'emergency' && (
                  <Text style={styles.filterChipCount}>
                    {' '}({contacts.filter(c => c.isEmergency).length})
                  </Text>
                )}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Results Count */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} found
          </Text>
          {filteredContacts.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Emergency Call All',
                  'Are you sure you want to call all emergency contacts?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Call All', style: 'destructive', onPress: () => {
                      const emergencyContacts = filteredContacts.filter(c => c.isEmergency);
                      if (emergencyContacts.length === 0) {
                        Alert.alert('No Emergency Contacts', 'No emergency contacts found.');
                        return;
                      }
                      Alert.alert(
                        'Emergency Call',
                        `Calling ${emergencyContacts.length} emergency contact${emergencyContacts.length > 1 ? 's' : ''}...`
                      );
                    }}
                  ]
                );
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.callAllText}>Call All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Contacts List */}
        {filteredContacts.length > 0 ? (
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item._id}
            renderItem={renderContactItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#DC2626']}
                tintColor="#DC2626"
              />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Contacts Found</Text>
            <Text style={styles.emptySubtitle}>
              {contacts.length === 0
                ? 'Add your emergency contacts for quick access during emergencies.'
                : 'No contacts match your current filter.'}
            </Text>
            {contacts.length === 0 ? (
              <TouchableOpacity
                style={styles.addContactButton}
                onPress={handleAddContact}
                activeOpacity={0.7}
              >
                <Text style={styles.addContactButtonText}>Add Emergency Contact</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.resetFilterButton}
                onPress={() => {
                  setSelectedFilter('all');
                  setSearchQuery('');
                  setFilteredContacts(contacts);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.resetFilterButtonText}>Reset Filter</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Add/Edit Contact Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Full Name</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter full name"
                  placeholderTextColor="#9CA3AF"
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Phone Number</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., +92-300-1234567"
                  placeholderTextColor="#9CA3AF"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({...formData, phone: text})}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Relationship</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., Brother, Mother, Doctor"
                  placeholderTextColor="#9CA3AF"
                  value={formData.relationship}
                  onChangeText={(text) => setFormData({...formData, relationship: text})}
                />
              </View>

              <TouchableOpacity
                style={styles.modalEmergencyToggle}
                onPress={() => setFormData({...formData, isEmergency: !formData.isEmergency})}
                activeOpacity={0.7}
              >
                <View style={styles.modalEmergencyToggleLeft}>
                  <Ionicons
                    name={formData.isEmergency ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={formData.isEmergency ? '#DC2626' : '#9CA3AF'}
                  />
                  <Text style={styles.modalEmergencyToggleText}>Mark as Emergency Contact</Text>
                </View>
                {formData.isEmergency && (
                  <View style={styles.emergencyBadge}>
                    <Text style={styles.emergencyBadgeText}>EMERGENCY</Text>
                  </View>
                )}
              </TouchableOpacity>
               <TouchableOpacity
  style={styles.modalSaveButton}
  onPress={handleSaveContact}
  activeOpacity={0.7}
>
  <LinearGradient
    colors={['#DC2626', '#B91C1C']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.modalSaveGradient}
  >
    <Text style={styles.modalSaveButtonText}>
      {editingContact ? 'Update Contact' : 'Add Contact'}
    </Text>
  </LinearGradient>
</TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addButton: {
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
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
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
  filterChipCount: {
    fontWeight: '400',
    opacity: 0.8,
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
  callAllText: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#DC2626',
    fontWeight: '600',
  },

  // List
  listContent: {
    paddingBottom: 80,
  },

  // Contact Card
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  contactCardEmergency: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  contactTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  contactInfo: {
    flex: 1,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactName: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  contactPhone: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#6B7280',
    marginTop: 2,
  },
  contactRelationship: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#9CA3AF',
    marginTop: 1,
  },
  contactRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 6,
  },

  // Badges
  emergencyBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  emergencyBadgeText: {
    fontSize: 7,
    fontWeight: '700',
    color: '#DC2626',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
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
    paddingHorizontal: 20,
  },
  addContactButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },
  addContactButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  resetFilterButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },
  resetFilterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalField: {
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  modalEmergencyToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  modalEmergencyToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalEmergencyToggleText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  modalSaveButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 12,
  },
  modalSaveGradient: {
    padding: 14,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default EmergencyContactsScreen;