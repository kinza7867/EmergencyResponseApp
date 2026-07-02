// src/components/StatusBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

type StatusType = 'pending' | 'in-progress' | 'resolved' | 'cancelled';

interface StatusBadgeProps {
  status: StatusType;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', color: theme.colors.warning };
      case 'in-progress':
        return { label: 'In Progress', color: theme.colors.primary };
      case 'resolved':
        return { label: 'Resolved', color: theme.colors.success };
      case 'cancelled':
        return { label: 'Cancelled', color: theme.colors.gray };
      default:
        return { label: 'Unknown', color: theme.colors.gray };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.color + '20' }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: theme.spacing.xs,
  },
  text: {
    ...theme.typography.caption,
    fontWeight: '500',
  },
});