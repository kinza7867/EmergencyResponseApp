// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { theme, colors, spacing, typography, shadows } from '../styles/theme';

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof colors;
  spacing: typeof spacing;
  typography: typeof typography;
  shadows: typeof shadows;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  const toggleTheme = () => setIsDark(!isDark);

  // Force light theme for emergency app (red theme on white)
  const themeColors = {
    ...colors,
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#333333',
    textPrimary: '#212121',
    textSecondary: '#616161',
    textHeading: '#111111',
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark: false,
        toggleTheme,
        colors: themeColors,
        spacing,
        typography,
        shadows,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;