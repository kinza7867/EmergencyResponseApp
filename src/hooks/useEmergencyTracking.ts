// src/hooks/useEmergencyTracking.ts
import { useState, useEffect, useRef } from 'react';
import { emergencyService, EmergencyRequest } from '../services/emergencyService';

interface TrackingState {
  request: EmergencyRequest | null;
  ambulanceLocation: { latitude: number; longitude: number } | null;
  eta: string;
  status: string;
  loading: boolean;
  error: string | null;
}

// Mock ambulance locations for demo
const AMBULANCE_ROUTES = [
  { latitude: 33.5751, longitude: 73.0269 },
  { latitude: 33.5771, longitude: 73.0249 },
  { latitude: 33.5791, longitude: 73.0229 },
  { latitude: 33.5811, longitude: 73.0209 },
  { latitude: 33.5831, longitude: 73.0189 },
  { latitude: 33.5851, longitude: 73.0169 },
  { latitude: 33.5871, longitude: 73.0149 },
];

export const useEmergencyTracking = (requestId: string) => {
  const [state, setState] = useState<TrackingState>({
    request: null,
    ambulanceLocation: null,
    eta: '8 minutes',
    status: 'dispatched',
    loading: true,
    error: null,
  });

  const routeIndex = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadRequest();
    startTrackingSimulation();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [requestId]);

  const loadRequest = async () => {
    try {
      const response = await emergencyService.getById(requestId);
      setState(prev => ({
        ...prev,
        request: response.data.request,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load request',
      }));
    }
  };

  const startTrackingSimulation = () => {
    // Set initial ambulance location
    setState(prev => ({
      ...prev,
      ambulanceLocation: AMBULANCE_ROUTES[0],
    }));

    // Simulate ambulance moving every 2 seconds
    intervalRef.current = setInterval(() => {
      routeIndex.current = (routeIndex.current + 1) % AMBULANCE_ROUTES.length;

      const newLocation = AMBULANCE_ROUTES[routeIndex.current];

      // Update ETA based on progress
      const progress = routeIndex.current / AMBULANCE_ROUTES.length;
      const etaMinutes = Math.max(1, Math.round(8 * (1 - progress)));

      setState(prev => ({
        ...prev,
        ambulanceLocation: newLocation,
        eta: `${etaMinutes} minutes`,
        status: etaMinutes <= 1 ? 'arriving' : 'en_route',
      }));
    }, 2000);
  };

  const refreshTracking = () => {
    routeIndex.current = 0;
    setState(prev => ({
      ...prev,
      ambulanceLocation: AMBULANCE_ROUTES[0],
      eta: '8 minutes',
      status: 'dispatched',
    }));
  };

  return {
    ...state,
    refreshTracking,
    isTracking: true,
  };
};

export default useEmergencyTracking;