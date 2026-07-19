import { ViewStyle } from 'react-native';

// Neutral slate shadows that read as a soft lift on the light theme surfaces.
export const Shadows = {
  card: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  } as ViewStyle,

  brutalism: {
    shadowColor: '#1e3a5f',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 0,
    elevation: 6,
  } as ViewStyle,

  modal: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  } as ViewStyle,

  tab: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  } as ViewStyle,
} as const;
