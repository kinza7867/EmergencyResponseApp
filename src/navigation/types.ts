// src/navigation/types.ts
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  InstantAssistance: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  SOS: undefined;
  History: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  Auth: undefined;
  Main: undefined;
  Confirmation: {
    requestId: string;
    emergencyType: string;
    timestamp: string;
  };
  Tracking: {
    requestId: string;
  };
  RequestDetails: {
    requestId: string;
  };
};