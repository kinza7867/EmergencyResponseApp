// src/hooks/useLocation.ts
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface LocationState {
  location: LocationCoords | null;
  loading: boolean;
  error: string | null;
  address: string | null;
}

export const useLocation = () => {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: true,
    error: null,
    address: null,
  });

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setState({
          location: null,
          loading: false,
          error: 'Location permission denied',
          address: null,
        });
        return;
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
      });

      const { latitude, longitude, accuracy } = position.coords;

      // Reverse geocode for address
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const address = geocode[0]
        ? [geocode[0].city, geocode[0].region, geocode[0].country]
            .filter(Boolean)
            .join(', ')
        : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

      setState({
        location: { latitude, longitude, accuracy },
        loading: false,
        error: null,
        address,
      });
    } catch (error) {
      setState({
        location: null,
        loading: false,
        error: 'Failed to get location',
        address: null,
      });
      Alert.alert('Location Error', 'Could not get your current location.');
    }
  };

  const refreshLocation = () => {
    getLocation();
  };

  return {
    ...state,
    refreshLocation,
  };
};

export default useLocation;