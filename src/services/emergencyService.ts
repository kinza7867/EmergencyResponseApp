// src/services/emergencyService.ts
// Mock service for Emergency Requests — Week 2 & 3 tasks.
// Stores requests in AsyncStorage so they survive app restarts.
// Week 2: submit, getById, getByUser
// Week 3: full history list, confirmation details

import AsyncStorage from '@react-native-async-storage/async-storage';

const REQUESTS_KEY = 'emergencyRequests';

export interface EmergencyRequest {
  id: string;
  userId: string;
  userName: string;
  emergencyType: string; // e.g. 'medical', 'fire', 'police', 'accident', 'other'
  notes: string;
  location: {
    label: string;      // human-readable city name
    latitude: number;
    longitude: number;
  };
  status: 'pending' | 'dispatched' | 'resolved' | 'cancelled';
  createdAt: string;   // ISO string
}

// ── helpers ─────────────────────────────────────────────────────────────────

const loadAll = async (): Promise<EmergencyRequest[]> => {
  try {
    const raw = await AsyncStorage.getItem(REQUESTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveAll = async (requests: EmergencyRequest[]): Promise<void> => {
  await AsyncStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
};

// ── public API ───────────────────────────────────────────────────────────────

export const emergencyService = {
  /**
   * POST /api/emergency — submit a new SOS request.
   * Returns { success, data: { request } }
   */
  submitRequest: async (payload: {
    userId: string;
    userName: string;
    emergencyType: string;
    notes: string;
    location: { label: string; latitude: number; longitude: number };
  }): Promise<{ success: boolean; data: { request: EmergencyRequest } }> => {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1000));

    const newRequest: EmergencyRequest = {
      id: `req-${Date.now()}`,
      ...payload,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const all = await loadAll();
    all.unshift(newRequest); // newest first
    await saveAll(all);

    return { success: true, data: { request: newRequest } };
  },

  /**
   * GET /api/emergency/{id} — get a single request by ID.
   */
  getById: async (id: string): Promise<{ success: boolean; data: { request: EmergencyRequest | null } }> => {
    await new Promise(r => setTimeout(r, 400));
    const all = await loadAll();
    const request = all.find(r => r.id === id) || null;
    return { success: true, data: { request } };
  },

  /**
   * GET /api/emergency?userId={id} — all requests for a user.
   */
  getByUser: async (userId: string): Promise<{ success: boolean; data: { requests: EmergencyRequest[] } }> => {
    await new Promise(r => setTimeout(r, 600));
    const all = await loadAll();
    const requests = all.filter(r => r.userId === userId);
    return { success: true, data: { requests } };
  },

  /**
   * PATCH /api/emergency/{id}/cancel — user cancels their own request.
   */
  cancelRequest: async (id: string): Promise<{ success: boolean }> => {
    await new Promise(r => setTimeout(r, 400));
    const all = await loadAll();
    const idx = all.findIndex(r => r.id === id);
    if (idx === -1) return { success: false };
    all[idx].status = 'cancelled';
    await saveAll(all);
    return { success: true };
  },

  /**
   * GET /api/emergency/{id}/location — Week 4
   * Returns current ambulance lat/lng (hardcoded mock this sprint per spec).
   */
  getLocation: async (id: string): Promise<{
    success: boolean;
    data: { latitude: number; longitude: number; label: string; updatedAt: string };
  }> => {
    await new Promise(r => setTimeout(r, 300));
    return {
      success: true,
      data: {
        latitude: 33.5823,
        longitude: 73.0285,
        label: 'District Rescue Station 7',
        updatedAt: new Date().toISOString(),
      },
    };
  },

  /**
   * Seed mock history so the History screen is not empty on first launch.
   * Only seeds if there are no existing requests for the given userId.
   */
  seedMockHistory: async (userId: string, userName: string): Promise<void> => {
    const all = await loadAll();
    const existing = all.filter(r => r.userId === userId);
    if (existing.length > 0) return; // already has data

    const mock: EmergencyRequest[] = [
      {
        id: 'mock-1',
        userId,
        userName,
        emergencyType: 'medical',
        notes: 'Patient needs immediate medical attention. Difficulty breathing.',
        location: { label: 'Rawalpindi, Punjab', latitude: 33.5651, longitude: 73.0169 },
        status: 'resolved',
        createdAt: new Date(Date.now() - 3_600_000).toISOString(),
      },
      {
        id: 'mock-2',
        userId,
        userName,
        emergencyType: 'police',
        notes: 'Suspicious activity reported near the market area.',
        location: { label: 'Islamabad, Capital', latitude: 33.6844, longitude: 73.0479 },
        status: 'pending',
        createdAt: new Date(Date.now() - 86_400_000).toISOString(),
      },
      {
        id: 'mock-3',
        userId,
        userName,
        emergencyType: 'fire',
        notes: 'Small fire in the kitchen area, now contained.',
        location: { label: 'Lahore, Punjab', latitude: 31.5204, longitude: 74.3587 },
        status: 'resolved',
        createdAt: new Date(Date.now() - 172_800_000).toISOString(),
      },
    ];

    const updated = [...mock, ...all];
    await saveAll(updated);
  },
};
