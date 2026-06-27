// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface AuthContextType {
  userToken: string | null;
  isLoading: boolean;
  signIn: (token: string, userData: UserData) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  userToken: null,
  isLoading: false,
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);

  const signIn = async (token: string, userData: UserData) => {
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    setUserToken(token);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    setUserToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        isLoading: false,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};