// src/styles/theme.ts

/* ===========================
   COLORS
=========================== */

export const colors = {
  // Primary - Red theme for emergency app
  primary: '#E53935',
  primaryLight: '#FFEBEE',
  primaryDark: '#C62828',
  primaryGradient: ['#E53935', '#C62828'],
  
  // Secondary red variants
  secondary: '#EF5350',
  secondaryLight: '#FFCDD2',
  
  // Red variants for different UI elements
  red: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#E53935',
    600: '#D32F2F',
    700: '#C62828',
    800: '#B71C1C',
    900: '#880E4F',
  },

  // Status colors (keeping these but with red emphasis)
  success: '#43A047',
  successBg: '#E8F5E9',

  danger: '#D32F2F',
  dangerBg: '#FFEBEE',

  error: '#D32F2F',
  errorBg: '#FFEBEE',

  warning: '#FFA726',
  warningBg: '#FFF8E1',

  info: '#1976D2',
  infoBg: '#E3F2FD',

  // Emergency Types - All red-themed
  fire: '#D32F2F',
  fireBg: '#FFEBEE',

  police: '#C62828',
  policeBg: '#FFEBEE',

  accident: '#B71C1C',
  accidentBg: '#FFEBEE',

  medical: '#E53935',
  medicalBg: '#FFEBEE',

  // Tab Colors - ADDED FOR NAVIGATION
  tabActive: '#E53935',
  tabInactive: '#9E9E9E',
  tabBackground: '#FFFFFF',

  // Backgrounds - Mostly white
  background: '#FFFFFF',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Alternative backgrounds
  backgroundLight: '#FAFAFA',
  backgroundGray: '#F5F5F5',

  // Text - Dark for readability on white
  text: '#333333',
  textPrimary: '#212121',
  textSecondary: '#616161',
  textMuted: '#9E9E9E',
  textHeading: '#111111',
  textLight: '#666666',
  textWhite: '#FFFFFF',
  textPlaceholder: '#BDBDBD', // ADDED for input placeholders

  // Grays
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  mediumGray: '#E0E0E0',
  gray: '#9E9E9E',
  darkGray: '#616161',

  // Borders - Light gray for subtle separation
  border: '#E0E0E0',
  borderLight: '#EEEEEE',
  borderRed: '#FFCDD2', // Red-tinted border for sections

  // Shadows - Subtle for white backgrounds
  shadow: 'rgba(0,0,0,0.08)',
  shadowRed: 'rgba(229, 57, 53, 0.15)',
};

/* ===========================
   SPACING
=========================== */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

/* ===========================
   BORDER RADIUS
=========================== */

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  round: 50,
  full: 9999,
};

/* ===========================
   FONT SIZES
=========================== */

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

/* ===========================
   FONT WEIGHTS
=========================== */

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

/* ===========================
   SHADOWS
=========================== */

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },

  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },

  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },

  primary: {
    shadowColor: '#E53935',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  
  danger: {
    shadowColor: '#D32F2F',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // New shadow specifically for cards on white background
  card: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
};

/* ===========================
   TYPOGRAPHY
=========================== */

export const typography = {
  h1: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    lineHeight: 40,
    color: colors.textPrimary,
  },

  h2: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    lineHeight: 34,
    color: colors.textPrimary,
  },

  h3: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: 30,
    color: colors.textPrimary,
  },

  h4: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: 26,
    color: colors.textPrimary,
  },

  body: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    lineHeight: 24,
    color: colors.text,
  },

  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    lineHeight: 16,
    color: colors.textMuted,
  },

  button: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    lineHeight: 22,
    color: colors.white,
  },

  buttonSmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: 20,
    color: colors.white,
  },
};

/* ===========================
   BUTTON VARIANTS
=========================== */

export const buttonVariants = {
  primary: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.primary,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.lg - 2,
  },
  
  ghost: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  
  danger: {
    backgroundColor: colors.danger,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.danger,
  },
  
  success: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
};

/* ===========================
   CARD VARIANTS
=========================== */

export const cardVariants = {
  default: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  
  elevated: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  
  outline: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  
  danger: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.danger,
    ...shadows.danger,
  },
};

/* ===========================
   THEME
=========================== */

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  fontSizes,
  fontWeights,
  shadows,
  buttonVariants,
  cardVariants,
};

export type Theme = typeof theme;

// Default export for easier importing
export default theme;