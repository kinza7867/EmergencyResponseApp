// src/components/MapContainer.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MapView, { MapMarker, Region } from 'react-native-maps';
import { MapMarker as CustomMapMarker } from './MapMarker';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../styles/theme';

const { width, height } = Dimensions.get('window');

interface MapContainerProps {
  userLocation: { latitude: number; longitude: number };
  ambulanceLocation?: { latitude: number; longitude: number } | null;
  hospitalLocations?: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  }>;
  onRegionChange?: (region: Region) => void;
  onMarkerPress?: (id: string) => void;
  loading?: boolean;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  userLocation,
  ambulanceLocation,
  hospitalLocations = [],
  onRegionChange,
  onMarkerPress,
  loading = false,
}) => {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>({
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const centerMapOnUser = () => {
    mapRef.current?.animateToRegion({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={onRegionChange}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        showsBuildings={true}
        showsTraffic={true}
      >
        {/* User Marker */}
        <MapMarker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          title="You are here"
          description="Your current location"
        >
          <CustomMapMarker type="user" label="You" size="medium" />
        </MapMarker>

        {/* Ambulance Marker */}
        {ambulanceLocation && (
          <MapMarker
            coordinate={{
              latitude: ambulanceLocation.latitude,
              longitude: ambulanceLocation.longitude,
            }}
            title="Ambulance"
            description="Responding unit"
          >
            <CustomMapMarker type="ambulance" label="Ambulance" size="large" />
          </MapMarker>
        )}

        {/* Hospital Markers */}
        {hospitalLocations.map((hospital) => (
          <MapMarker
            key={hospital.id}
            coordinate={{
              latitude: hospital.latitude,
              longitude: hospital.longitude,
            }}
            title={hospital.name}
            onPress={() => onMarkerPress?.(hospital.id)}
          >
            <CustomMapMarker type="hospital" label={hospital.name} size="small" />
          </MapMarker>
        ))}
      </MapView>

      {/* Center Button */}
      <TouchableOpacity
        style={styles.centerButton}
        onPress={centerMapOnUser}
        activeOpacity={0.8}
      >
        <Text style={styles.centerButtonText}>📍</Text>
      </TouchableOpacity>

      {/* Info Overlay */}
      <View style={styles.infoOverlay}>
        <View style={styles.infoDot}>
          <Text style={styles.infoDotText}>●</Text>
          <Text style={styles.infoDotLabel}>You</Text>
        </View>
        <View style={styles.infoDot}>
          <Text style={[styles.infoDotText, { color: colors.danger }]}>●</Text>
          <Text style={styles.infoDotLabel}>Ambulance</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    minHeight: 200,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  centerButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.white,
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  centerButtonText: {
    fontSize: 24,
  },
  infoOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    ...shadows.sm,
  },
  infoDot: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  infoDotText: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 4,
  },
  infoDotLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});