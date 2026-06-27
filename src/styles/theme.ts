// src/styles/theme.ts
// Centralised design tokens — import from here across all screens.
// Never hardcode hex values or magic numbers inside screen files.

export const colors = {
  // ── Brand ──────────────────────────────────────────────
  primary: '#1D4ED8',
  primaryLight: '#2563EB',
  primaryDark: '#1E40AF',
  primaryBg: '#DBEAFE',

  // ── Semantic ────────────────────────────────────────────
  success: '#10B981',
  successBg: '#D1FAE5',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  danger: '#EF4444',
  dangerBg: '#FEE2E2',
  fire: '#FF6B35',
  fireBg: '#FFF7ED',
  police: '#2563EB',
  policeBg: '#DBEAFE',
  accident: '#D97706',
  accidentBg: '#FEF3C7',

  // ── UI surfaces ─────────────────────────────────────────
  background: '#F8FAFC',
  card: '#FFFFFF',
  inputBg: '#F9FAFB',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',

  // ── Text ────────────────────────────────────────────────
  textPrimary: '#111827',
  textHeading: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textWhite: '#FFFFFF',
  textPlaceholder: '#9CA3AF',

  // ── Tab bar ─────────────────────────────────────────────
  tabActive: '#2563EB',
  tabInactive: '#6B7280',
  tabBar: '#FFFFFF',
  tabBorder: '#E5E7EB',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const fontSizes = {
  xs: 10,
  sm: 12,
  base: 13,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
};

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  primary: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  danger: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
};

const theme = {
  colors,
  spacing,
  borderRadius,
  fontSizes,
  fontWeights,
  shadows,
};

export default theme;