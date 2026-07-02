// src/components/MapMarker.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../styles/theme';

interface MapMarkerProps {
  type: 'user' | 'ambulance' | 'hospital';
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

export const MapMarker: React.FC<MapMarkerProps> = ({
  type,
  label,
  size = 'medium',
}) => {
  const getMarkerConfig = () => {
    switch (type) {
      case 'user':
        return {
          emoji: '📍',
          backgroundColor: colors.primary,
          borderColor: colors.white,
          pulseColor: 'rgba(229, 57, 53, 0.3)',
        };
      case 'ambulance':
        return {
          emoji: '🚑',
          backgroundColor: colors.danger,
          borderColor: colors.white,
          pulseColor: 'rgba(211, 47, 47, 0.3)',
        };
      case 'hospital':
        return {
          emoji: '🏥',
          backgroundColor: colors.success,
          borderColor: colors.white,
          pulseColor: 'rgba(67, 160, 71, 0.3)',
        };
    }
  };

  const config = getMarkerConfig();
  const sizeMap = {
    small: 30,
    medium: 40,
    large: 50,
  };
  const markerSize = sizeMap[size];

  return (
    <View style={styles.markerContainer}>
      <View
        style={[
          styles.marker,
          {
            width: markerSize,
            height: markerSize,
            borderRadius: markerSize / 2,
            backgroundColor: config.backgroundColor,
            borderColor: config.borderColor,
            borderWidth: 2,
          },
        ]}
      >
        <Text style={[styles.markerEmoji, { fontSize: markerSize / 1.8 }]}>
          {config.emoji}
        </Text>
      </View>
      {label && <Text style={styles.markerLabel}>{label}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  markerEmoji: {
    textAlign: 'center',
  },
  markerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});