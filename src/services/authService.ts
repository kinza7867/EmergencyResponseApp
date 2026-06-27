// src/services/authService.ts
// Mock auth service with AsyncStorage persistence.
// Registered users are stored and survive app restarts.
// login() merges persisted users with the built-in demo account each call.

import AsyncStorage from '@react-native-async-storage/async-storage';

const REGISTERED_USERS_KEY = 'registeredUsers';

// Built-in demo account — always available regardless of AsyncStorage state
const DEFAULT_USERS = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'password123',
    phone: '03001234567',
  },
];

/** Load all users: default demo account + anyone who has registered */
const getUsers = async (): Promise<any[]> => {
  try {
    const stored = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
    if (stored) {
      const storedUsers: any[] = JSON.parse(stored);
      // Merge: put defaults first, then append any registered users
      const merged = [...DEFAULT_USERS];
      for (const u of storedUsers) {
        if (!merged.find(m => m.email === u.email)) {
          merged.push(u);
        }
      }
      return merged;
    }
  } catch (e) {
    console.error('[authService] Failed to read users from storage:', e);
  }
  return [...DEFAULT_USERS];
};

/** Persist newly registered users (never overwrites the built-in demo account) */
const saveUsers = async (users: any[]): Promise<void> => {
  try {
    // Only persist non-default accounts
    const toSave = users.filter(u => u.id !== '1');
    await AsyncStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('[authService] Failed to save users to storage:', e);
  }
};

export const authService = {
  /** Validate credentials against persisted + default users, return mock JWT */
  login: async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const users = await getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('No account found with this email. Please register first.');
    }
    if (user.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    return {
      success: true,
      data: {
        token: `mock-jwt-token-${Date.now()}`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      },
    };
  },

  /** Register a new user and persist to AsyncStorage */
  register: async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const users = await getUsers();
    const existing = users.find(
      u => u.email.toLowerCase() === userData.email.toLowerCase()
    );

    if (existing) {
      throw new Error('This email is already registered. Please login instead.');
    }

    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await saveUsers(users);

    return {
      success: true,
      data: {
        message: 'Registration successful',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
        },
      },
    };
  },

  /** Verify an email exists (for future forgot-password feature) */
  forgotPassword: async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const users = await getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('No account found with this email.');
    }
    return {
      success: true,
      data: { message: 'Password reset link sent to your email.' },
    };
  },
};