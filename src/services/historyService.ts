// src/services/historyService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface EmergencyRequest {
  id: string;
  type: 'Medical' | 'Fire' | 'Crime' | 'Road Accident' | 'Natural Disaster' | 'Other';
  description: string;
  notes?: string;
  timestamp: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'cancelled';
  location?: {
    address: string;
    lat: number;
    lng: number;
  };
  responder?: {
    name: string;
    phone: string;
    eta: string;
  };
}

export interface EmergencyDetails extends EmergencyRequest {
  timeline: Array<{
    time: string;
    status: string;
  }>;
  hospital?: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
}

export interface HistoryFilters {
  search?: string;
  status?: 'pending' | 'in-progress' | 'resolved' | 'cancelled';
  type?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'type' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface HistoryResponse {
  success: boolean;
  data: EmergencyRequest[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DetailsResponse {
  success: boolean;
  data: EmergencyDetails;
  message?: string;
}

// Base API URL - replace with your actual API endpoint
const API_BASE_URL = 'https://api.emergencyapp.com';

// Mock data for development
const MOCK_HISTORY: EmergencyRequest[] = [
  {
    id: 'REQ-001',
    type: 'Medical',
    description: 'Severe chest pain and difficulty breathing',
    notes: 'Patient is 65 years old with history of heart disease',
    timestamp: '2026-06-25T14:30:00Z',
    status: 'resolved',
    location: {
      address: '123 Main St, City, State 12345',
      lat: 40.7128,
      lng: -74.0060,
    },
    responder: {
      name: 'Ambulance 42',
      phone: '+1-555-0123',
      eta: '5 minutes',
    },
  },
  {
    id: 'REQ-002',
    type: 'Fire',
    description: 'Small kitchen fire in apartment building',
    notes: 'Building has 5 floors, fire on 2nd floor',
    timestamp: '2026-06-24T09:15:00Z',
    status: 'in-progress',
    location: {
      address: '456 Oak Ave, City, State 12345',
      lat: 40.7142,
      lng: -74.0080,
    },
    responder: {
      name: 'Fire Truck 7',
      phone: '+1-555-0456',
      eta: '8 minutes',
    },
  },
  {
    id: 'REQ-003',
    type: 'Crime',
    description: 'Suspicious activity reported at local park',
    notes: 'Two individuals acting suspiciously near playground',
    timestamp: '2026-06-23T20:45:00Z',
    status: 'pending',
    location: {
      address: '789 Park Ln, City, State 12345',
      lat: 40.7100,
      lng: -74.0100,
    },
  },
  {
    id: 'REQ-004',
    type: 'Road Accident',
    description: 'Minor fender bender on highway',
    notes: 'Two cars involved, no serious injuries reported',
    timestamp: '2026-06-22T16:20:00Z',
    status: 'resolved',
    location: {
      address: 'Highway 101, Mile Marker 42',
      lat: 40.7200,
      lng: -74.0050,
    },
    responder: {
      name: 'Police Unit 12',
      phone: '+1-555-0789',
      eta: '2 minutes',
    },
  },
  {
    id: 'REQ-005',
    type: 'Natural Disaster',
    description: 'Flood warning in low-lying areas',
    notes: 'Heavy rainfall causing water levels to rise',
    timestamp: '2026-06-21T11:00:00Z',
    status: 'cancelled',
    location: {
      address: 'Riverfront Area, City, State 12345',
      lat: 40.7150,
      lng: -74.0090,
    },
  },
  {
    id: 'REQ-006',
    type: 'Medical',
    description: 'Severe allergic reaction',
    notes: 'Patient experienced anaphylaxis after eating peanuts',
    timestamp: '2026-06-20T08:30:00Z',
    status: 'resolved',
    location: {
      address: '321 Elm St, City, State 12345',
      lat: 40.7130,
      lng: -74.0070,
    },
    responder: {
      name: 'Ambulance 15',
      phone: '+1-555-0101',
      eta: '3 minutes',
    },
  },
  {
    id: 'REQ-007',
    type: 'Crime',
    description: 'Burglary in progress',
    notes: 'Someone breaking into a house on Maple Street',
    timestamp: '2026-06-19T23:10:00Z',
    status: 'in-progress',
    location: {
      address: '555 Maple St, City, State 12345',
      lat: 40.7160,
      lng: -74.0110,
    },
    responder: {
      name: 'Police Unit 5',
      phone: '+1-555-0202',
      eta: '4 minutes',
    },
  },
];

const MOCK_DETAILS: Record<string, EmergencyDetails> = {
  'REQ-001': {
    id: 'REQ-001',
    type: 'Medical',
    description: 'Severe chest pain and difficulty breathing',
    notes: 'Patient is 65 years old with history of heart disease',
    timestamp: '2026-06-25T14:30:00Z',
    status: 'resolved',
    location: {
      address: '123 Main St, City, State 12345',
      lat: 40.7128,
      lng: -74.0060,
    },
    responder: {
      name: 'Ambulance 42',
      phone: '+1-555-0123',
      eta: '5 minutes',
    },
    timeline: [
      { time: '2:30 PM', status: 'Request submitted' },
      { time: '2:32 PM', status: 'Responder assigned' },
      { time: '2:35 PM', status: 'Responder en route' },
      { time: '2:40 PM', status: 'Responder arrived' },
      { time: '2:45 PM', status: 'Patient transported' },
      { time: '3:00 PM', status: 'Patient admitted' },
    ],
    hospital: {
      id: 'HOSP-001',
      name: 'City General Hospital',
      address: '100 Medical Blvd, City, State 12345',
      phone: '+1-555-0303',
    },
  },
  'REQ-002': {
    id: 'REQ-002',
    type: 'Fire',
    description: 'Small kitchen fire in apartment building',
    notes: 'Building has 5 floors, fire on 2nd floor',
    timestamp: '2026-06-24T09:15:00Z',
    status: 'in-progress',
    location: {
      address: '456 Oak Ave, City, State 12345',
      lat: 40.7142,
      lng: -74.0080,
    },
    responder: {
      name: 'Fire Truck 7',
      phone: '+1-555-0456',
      eta: '8 minutes',
    },
    timeline: [
      { time: '9:15 AM', status: 'Request submitted' },
      { time: '9:17 AM', status: 'Fire department notified' },
      { time: '9:20 AM', status: 'Fire trucks dispatched' },
      { time: '9:23 AM', status: 'Fire trucks en route' },
    ],
    hospital: {
      id: 'HOSP-002',
      name: 'St. Mary\'s Hospital',
      address: '200 Health Ave, City, State 12345',
      phone: '+1-555-0404',
    },
  },
};

export const historyService = {
  /**
   * Get emergency history for the current user
   * @param filters - Optional filters for searching and sorting
   * @returns Promise with history data
   */
  getEmergencyHistory: async (filters?: HistoryFilters): Promise<HistoryResponse> => {
    try {
      // Get auth token
      const token = await AsyncStorage.getItem('userToken');
      
      // For development, use mock data
      if (process.env.NODE_ENV === 'development') {
        let filteredData = [...MOCK_HISTORY];
        
        // Apply filters
        if (filters) {
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filteredData = filteredData.filter(item =>
              item.description.toLowerCase().includes(searchLower) ||
              item.id.toLowerCase().includes(searchLower) ||
              item.type.toLowerCase().includes(searchLower)
            );
          }
          
          if (filters.status) {
            filteredData = filteredData.filter(item => item.status === filters.status);
          }
          
          if (filters.type) {
            filteredData = filteredData.filter(item => item.type === filters.type);
          }
          
          if (filters.startDate) {
            const start = new Date(filters.startDate);
            filteredData = filteredData.filter(item => new Date(item.timestamp) >= start);
          }
          
          if (filters.endDate) {
            const end = new Date(filters.endDate);
            filteredData = filteredData.filter(item => new Date(item.timestamp) <= end);
          }
          
          // Sort
          if (filters.sortBy) {
            filteredData.sort((a, b) => {
              let comparison = 0;
              switch (filters.sortBy) {
                case 'date':
                  comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                  break;
                case 'type':
                  comparison = a.type.localeCompare(b.type);
                  break;
                case 'status':
                  comparison = a.status.localeCompare(b.status);
                  break;
                default:
                  comparison = 0;
              }
              return filters.sortOrder === 'desc' ? -comparison : comparison;
            });
          }
        }
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return {
          success: true,
          data: filteredData,
          message: 'History retrieved successfully',
          pagination: {
            page: 1,
            limit: 10,
            total: filteredData.length,
            pages: Math.ceil(filteredData.length / 10),
          },
        };
      }
      
      // Production API call
      const response = await axios.get<HistoryResponse>(
        `${API_BASE_URL}/emergency/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: filters,
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Get history error:', error);
      
      // Return mock data if API fails (for development)
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          data: MOCK_HISTORY,
          message: 'Using mock data (API unavailable)',
        };
      }
      
      throw {
        success: false,
        message: 'Failed to load emergency history',
        error: error,
      };
    }
  },

  /**
   * Get detailed information about a specific emergency request
   * @param requestId - The ID of the emergency request
   * @returns Promise with detailed emergency data
   */
  getEmergencyDetails: async (requestId: string): Promise<DetailsResponse> => {
    try {
      // Get auth token
      const token = await AsyncStorage.getItem('userToken');
      
      // For development, use mock data
      if (process.env.NODE_ENV === 'development') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        const details = MOCK_DETAILS[requestId];
        
        if (!details) {
          // If request not found, generate mock details from history item
          const historyItem = MOCK_HISTORY.find(item => item.id === requestId);
          if (historyItem) {
            return {
              success: true,
              data: {
                ...historyItem,
                timeline: [
                  { time: 'Request submitted', status: new Date(historyItem.timestamp).toLocaleTimeString() },
                  { time: 'Processing', status: new Date(new Date(historyItem.timestamp).getTime() + 2 * 60000).toLocaleTimeString() },
                  { time: 'Assigned', status: new Date(new Date(historyItem.timestamp).getTime() + 5 * 60000).toLocaleTimeString() },
                ],
              },
              message: 'Details retrieved successfully',
            };
          }
          
          return {
            success: false,
            data: {} as EmergencyDetails,
            message: 'Emergency request not found',
          };
        }
        
        return {
          success: true,
          data: details,
          message: 'Details retrieved successfully',
        };
      }
      
      // Production API call
      const response = await axios.get<DetailsResponse>(
        `${API_BASE_URL}/emergency/${requestId}/details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Get emergency details error:', error);
      
      // Return mock data if API fails (for development)
      if (process.env.NODE_ENV === 'development') {
        const mockDetails = MOCK_DETAILS[requestId] || {
          id: requestId,
          type: 'Medical',
          description: 'Emergency request details',
          timestamp: new Date().toISOString(),
          status: 'pending',
          timeline: [
            { time: 'Just now', status: 'Request submitted' },
          ],
        };
        
        return {
          success: true,
          data: mockDetails,
          message: 'Using mock data (API unavailable)',
        };
      }
      
      throw {
        success: false,
        message: 'Failed to load emergency details',
        error: error,
      };
    }
  },

  /**
   * Get emergency requests by status
   * @param status - The status to filter by
   * @returns Promise with filtered history data
   */
  getEmergencyByStatus: async (status: EmergencyRequest['status']): Promise<HistoryResponse> => {
    return historyService.getEmergencyHistory({ status });
  },

  /**
   * Search emergency requests
   * @param query - Search query string
   * @returns Promise with search results
   */
  searchEmergency: async (query: string): Promise<HistoryResponse> => {
    return historyService.getEmergencyHistory({ search: query });
  },

  /**
   * Get recent emergency requests
   * @param limit - Number of requests to return
   * @returns Promise with recent requests
   */
  getRecentEmergencies: async (limit: number = 5): Promise<EmergencyRequest[]> => {
    const response = await historyService.getEmergencyHistory({
      sortBy: 'date',
      sortOrder: 'desc',
    });
    
    return response.data.slice(0, limit);
  },

  /**
   * Get emergency statistics
   * @returns Promise with statistics
   */
  getEmergencyStats: async () => {
    try {
      const response = await historyService.getEmergencyHistory();
      const data = response.data;
      
      const stats = {
        total: data.length,
        pending: data.filter(item => item.status === 'pending').length,
        inProgress: data.filter(item => item.status === 'in-progress').length,
        resolved: data.filter(item => item.status === 'resolved').length,
        cancelled: data.filter(item => item.status === 'cancelled').length,
        byType: {} as Record<string, number>,
      };
      
      // Count by type
      data.forEach(item => {
        stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
      });
      
      return {
        success: true,
        data: stats,
        message: 'Statistics retrieved successfully',
      };
    } catch (error) {
      console.error('Get stats error:', error);
      throw {
        success: false,
        message: 'Failed to load statistics',
        error: error,
      };
    }
  },

  /**
   * Delete an emergency request (if allowed)
   * @param requestId - The ID of the request to delete
   * @returns Promise with deletion status
   */
  deleteEmergency: async (requestId: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // For development
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          success: true,
          message: 'Emergency request deleted successfully',
        };
      }
      
      const response = await axios.delete(
        `${API_BASE_URL}/emergency/${requestId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Delete emergency error:', error);
      throw {
        success: false,
        message: 'Failed to delete emergency request',
        error: error,
      };
    }
  },
};

export default historyService;