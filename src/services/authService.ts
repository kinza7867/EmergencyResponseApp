import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;

      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

      return {
        success: true,
        data: {
          token,
          user,
        },
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Login failed'
      );
    }
  },

  register: async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      const response = await api.post('/auth/register', userData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Registration failed'
      );
    }
  },

  forgotPassword: async () => {
    throw new Error('Forgot Password is not implemented yet.');
  },
};