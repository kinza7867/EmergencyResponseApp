// src/screens/NotificationsScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  Vibration,
  Animated,
  StatusBar,
  RefreshControl,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const LOGO = require('../../assets/logo.png');
const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 380;

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'emergency' | 'alert' | 'update' | 'info';
  category?: string;
}

export const NotificationsScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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

    loadNotifications();
  }, []);

  const loadNotifications = () => {
    setIsLoading(true);
    // Mock notifications data
    const mockNotifications: NotificationItem[] = [
      {
        id: '1',
        title: 'Emergency Alert',
        message: 'Flood warning issued in your area. Please stay indoors and avoid flooded roads.',
        time: '2 min ago',
        read: false,
        type: 'emergency',
        category: 'Weather',
      },
      {
        id: '2',
        title: 'Location Shared',
        message: 'Your location has been successfully shared with emergency contacts.',
        time: '15 min ago',
        read: false,
        type: 'alert',
        category: 'Safety',
      },
      {
        id: '3',
        title: 'Hospital Alert',
        message: 'City General Hospital is currently at full capacity. Please consider alternative hospitals.',
        time: '1 hour ago',
        read: true,
        type: 'alert',
        category: 'Medical',
      },
      {
        id: '4',
        title: 'Request Update',
        message: 'Your emergency request #1234 has been assigned to a responder.',
        time: '3 hours ago',
        read: true,
        type: 'update',
        category: 'Request',
      },
      {
        id: '5',
        title: 'Safety Tip',
        message: 'Keep your emergency contacts updated. Review your emergency plan today.',
        time: '5 hours ago',
        read: true,
        type: 'info',
        category: 'Safety',
      },
      {
        id: '6',
        title: 'Critical Alert',
        message: 'Severe weather warning: Heavy thunderstorms expected. Take precautions.',
        time: '2 hours ago',
        read: false,
        type: 'emergency',
        category: 'Weather',
      },
      {
        id: '7',
        title: 'App Update',
        message: 'Emergency Response App v1.1.0 is now available. Update for new features.',
        time: '1 day ago',
        read: true,
        type: 'update',
        category: 'App',
      },
      {
        id: '8',
        title: 'Emergency Contact Added',
        message: 'Your emergency contact has been updated successfully.',
        time: '2 days ago',
        read: true,
        type: 'info',
        category: 'Contacts',
      },
    ];

    setNotifications(mockNotifications);
    setFilteredNotifications(mockNotifications);
    updateUnreadCount(mockNotifications);
    setIsLoading(false);
  };

  const updateUnreadCount = (items: NotificationItem[]) => {
    const count = items.filter(item => !item.read).length;
    setUnreadCount(count);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = (notification: NotificationItem) => {
    Vibration.vibrate(20);
    
    // Mark as read
    const updatedNotifications = notifications.map(item =>
      item.id === notification.id ? { ...item, read: true } : item
    );
    setNotifications(updatedNotifications);
    filterNotifications(updatedNotifications, selectedFilter);
    updateUnreadCount(updatedNotifications);

    // Show details
    Alert.alert(
      notification.title,
      `${notification.message}\n\nTime: ${notification.time}\nCategory: ${notification.category || 'General'}`,
      [
        { text: 'OK' },
        ...(notification.type === 'emergency' ? [
          { 
            text: 'View Emergency', 
            onPress: () => navigation.navigate('SOS')
          }
        ] : [])
      ]
    );
  };

  const handleMarkAllAsRead = () => {
    Vibration.vibrate(20);
    const updatedNotifications = notifications.map(item => ({ ...item, read: true }));
    setNotifications(updatedNotifications);
    filterNotifications(updatedNotifications, selectedFilter);
    updateUnreadCount(updatedNotifications);
    Alert.alert('Success', 'All notifications marked as read.');
  };

  const handleDeleteAll = () => {
    Vibration.vibrate(30);
    Alert.alert(
      'Delete All',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive',
          onPress: () => {
            setNotifications([]);
            setFilteredNotifications([]);
            setUnreadCount(0);
            Alert.alert('Success', 'All notifications deleted.');
          }
        }
      ]
    );
  };

  const handleDeleteSingle = (id: string) => {
    Vibration.vibrate(20);
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const updatedNotifications = notifications.filter(item => item.id !== id);
            setNotifications(updatedNotifications);
            filterNotifications(updatedNotifications, selectedFilter);
            updateUnreadCount(updatedNotifications);
          }
        }
      ]
    );
  };

  const filterNotifications = (items: NotificationItem[], filter: string) => {
    let filtered = items;
    if (filter !== 'all') {
      filtered = items.filter(item => item.type === filter);
    }
    setFilteredNotifications(filtered);
  };

  const handleFilterSelect = (filter: string) => {
    Vibration.vibrate(20);
    setSelectedFilter(filter);
    filterNotifications(notifications, filter);
  };

  const getFilterCount = (type: string) => {
    if (type === 'all') return notifications.length;
    return notifications.filter(item => item.type === type).length;
  };

  const getTypeIcon = (type: string): any => {
    switch(type) {
      case 'emergency': return 'alert-circle';
      case 'alert': return 'warning';
      case 'update': return 'refresh';
      case 'info': return 'information-circle';
      default: return 'notifications';
    }
  };

  const getTypeColor = (type: string): string => {
    switch(type) {
      case 'emergency': return '#DC2626';
      case 'alert': return '#F59E0B';
      case 'update': return '#3B82F6';
      case 'info': return '#22C55E';
      default: return '#6B7280';
    }
  };

  const renderNotificationItem = ({ item, index }: { item: NotificationItem; index: number }) => (
    <Animated.View
      style={[
        styles.notificationCard,
        !item.read && styles.notificationCardUnread,
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
        style={styles.notificationTouchable}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationHeader}>
          <View style={styles.notificationLeft}>
            <View style={[styles.notificationIcon, { backgroundColor: getTypeColor(item.type) + '20' }]}>
              <Ionicons name={getTypeIcon(item.type)} size={20} color={getTypeColor(item.type)} />
            </View>
            <View style={styles.notificationInfo}>
              <View style={styles.notificationTitleRow}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                {!item.read && <View style={styles.unreadDot} />}
              </View>
              <View style={styles.notificationMeta}>
                <Text style={styles.notificationCategory}>{item.category}</Text>
                <View style={styles.notificationDot} />
                <Text style={styles.notificationTime}>{item.time}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => handleDeleteSingle(item.id)}
            activeOpacity={0.7}
            style={styles.deleteButton}
          >
            <Ionicons name="close" size={18} color="#D1D5DB" />
          </TouchableOpacity>
        </View>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        {item.type === 'emergency' && (
          <View style={styles.emergencyBadge}>
            <Ionicons name="alert-circle" size={12} color="#DC2626" />
            <Text style={styles.emergencyBadgeText}>EMERGENCY</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'alert', label: 'Alerts' },
    { id: 'update', label: 'Updates' },
    { id: 'info', label: 'Info' },
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
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>

          <View style={styles.headerRight}>
            {unreadCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              activeOpacity={0.7}
              style={styles.markReadButton}
            >
              <Ionicons name="checkmark-done" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.container}>
        {/* Filters */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
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
                  {filter.id !== 'all' && (
                    <Text style={styles.filterChipCount}>
                      {' '}({getFilterCount(filter.id)})
                    </Text>
                  )}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.notificationsCount}>
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
          </Text>
          {filteredNotifications.length > 0 && (
            <TouchableOpacity
              onPress={handleDeleteAll}
              activeOpacity={0.7}
              style={styles.deleteAllButton}
            >
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
              <Text style={styles.deleteAllText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <FlatList
            data={filteredNotifications}
            keyExtractor={(item) => item.id}
            renderItem={renderNotificationItem}
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
            <Ionicons name="notifications-off" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              {notifications.length === 0 
                ? 'You have no notifications yet.' 
                : 'No notifications match your current filter.'}
            </Text>
            {notifications.length > 0 && (
              <TouchableOpacity
                style={styles.resetFilterButton}
                onPress={() => {
                  setSelectedFilter('all');
                  filterNotifications(notifications, 'all');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.resetFilterButtonText}>Reset Filter</Text>
              </TouchableOpacity>
            )}
          </View>
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
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markReadButton: {
    padding: 4,
    marginLeft: 8,
  },
  badgeContainer: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#1F2937',
    fontSize: 10,
    fontWeight: '700',
  },

  // Filters
  filterContainer: {
    marginTop: 16,
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
    fontSize: isSmallDevice ? 11 : 12,
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

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  notificationsCount: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  deleteAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deleteAllText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#DC2626',
    fontWeight: '600',
  },

  // List
  listContent: {
    paddingBottom: 80,
  },

  // Notification Card
  notificationCard: {
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
  notificationCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationTouchable: {
    padding: 14,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notificationLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notificationTitle: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  notificationCategory: {
    fontSize: isSmallDevice ? 9 : 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  notificationDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 6,
  },
  notificationTime: {
    fontSize: isSmallDevice ? 9 : 10,
    color: '#9CA3AF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  deleteButton: {
    padding: 4,
  },
  notificationMessage: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#4B5563',
    lineHeight: 18,
    marginTop: 6,
    marginLeft: 52,
  },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 8,
    marginLeft: 52,
    alignSelf: 'flex-start',
    gap: 4,
  },
  emergencyBadgeText: {
    fontSize: 8,
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
});

export default NotificationsScreen;