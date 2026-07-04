export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  card: 24,
  button: 18,
  tile: 20,
  chip: 999,
} as const;

/** Minimum accessible tap target sizes. */
export const tapTarget = {
  min: 48,
  game: 60,
} as const;

export const shadows = {
  card: {
    shadowColor: '#102A43',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  button: {
    shadowColor: '#102A43',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
} as const;
