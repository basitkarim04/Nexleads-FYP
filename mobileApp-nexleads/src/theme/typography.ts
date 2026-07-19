import { TextStyle } from 'react-native';

export const Typography = {
  headlineXL: {
    fontFamily: 'Poppins_900Black',
    fontSize: 30,
    lineHeight: 38,
  } as TextStyle,

  headlineL: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    lineHeight: 32,
  } as TextStyle,

  headlineM: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    lineHeight: 30,
  } as TextStyle,

  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    lineHeight: 26,
  } as TextStyle,

  bodyLarge: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    lineHeight: 22,
  } as TextStyle,

  body: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 21,
  } as TextStyle,

  caption: {
    fontFamily: 'Poppins_300Light',
    fontSize: 12,
    lineHeight: 18,
  } as TextStyle,

  captionXS: {
    fontFamily: 'Poppins_300Light',
    fontSize: 11,
    lineHeight: 16,
  } as TextStyle,

  button: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
  } as TextStyle,

  buttonL: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
  } as TextStyle,

  label: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    lineHeight: 18,
  } as TextStyle,

  metric: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    lineHeight: 36,
  } as TextStyle,
} as const;
