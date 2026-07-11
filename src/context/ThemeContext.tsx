// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  background: string;
  card: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  iconColor: string;
  iconBg: string;
  primary: string;
  primaryLight: string;
  danger: string;
  success: string;
  warning: string;
  toggleTrackFalse: string;
  toggleTrackTrue: string;
  toggleThumb: string;
  shadowColor: string;
  shadowOpacity: number;
  borderColor: string;
  inputBg: string;
  inputBorder: string;
  headerBg: string;
  headerText: string;
  tabBg: string;
  tabActive: string;
  tabInactive: string;
}

interface ThemeContextType {
  isDarkMode: boolean;
  colors: ThemeColors;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

const lightTheme: ThemeColors = {
  background: '#F5F5F5',
  card: '#FFFFFF',
  cardBorder: '#F3F4F6',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  iconColor: '#6B7280',
  iconBg: '#F3F4F6',
  primary: '#DC2626',
  primaryLight: '#FEF2F2',
  danger: '#DC2626',
  success: '#22C55E',
  warning: '#F59E0B',
  toggleTrackFalse: '#E5E7EB',
  toggleTrackTrue: '#DC2626',
  toggleThumb: '#FFFFFF',
  shadowColor: '#000',
  shadowOpacity: 0.08,
  borderColor: '#F3F4F6',
  inputBg: '#F9FAFB',
  inputBorder: '#E5E7EB',
  headerBg: '#DC2626',
  headerText: '#FFFFFF',
  tabBg: '#FFFFFF',
  tabActive: '#DC2626',
  tabInactive: '#9CA3AF',
};

const darkTheme: ThemeColors = {
  background: '#0F0F1A',
  card: '#1A1A2E',
  cardBorder: '#2D2D44',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0C8',
  textMuted: '#6B7280',
  iconColor: '#B0B0C8',
  iconBg: '#2D2D44',
  primary: '#DC2626',
  primaryLight: '#2D1A1A',
  danger: '#DC2626',
  success: '#22C55E',
  warning: '#F59E0B',
  toggleTrackFalse: '#3D3D5A',
  toggleTrackTrue: '#DC2626',
  toggleThumb: '#FFFFFF',
  shadowColor: '#000',
  shadowOpacity: 0.4,
  borderColor: '#2D2D44',
  inputBg: '#2D2D44',
  inputBorder: '#3D3D5A',
  headerBg: '#1A1A2E',
  headerText: '#FFFFFF',
  tabBg: '#1A1A2E',
  tabActive: '#DC2626',
  tabInactive: '#6B7280',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem('userSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        setIsDarkMode(settings.darkMode || false);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  // Listen for changes in AsyncStorage
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const saved = await AsyncStorage.getItem('userSettings');
        if (saved) {
          const settings = JSON.parse(saved);
          const newDarkMode = settings.darkMode || false;
          if (newDarkMode !== isDarkMode) {
            setIsDarkMode(newDarkMode);
          }
        }
      } catch (error) {
        console.log('Error checking theme:', error);
      }
    }, 500); // Check every 500ms

    return () => clearInterval(interval);
  }, [isDarkMode]);

  const toggleDarkMode = async () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    try {
      const saved = await AsyncStorage.getItem('userSettings');
      const settings = saved ? JSON.parse(saved) : {};
      settings.darkMode = newValue;
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const setDarkMode = async (value: boolean) => {
    setIsDarkMode(value);
    try {
      const saved = await AsyncStorage.getItem('userSettings');
      const settings = saved ? JSON.parse(saved) : {};
      settings.darkMode = value;
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const colors = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, colors, toggleDarkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};