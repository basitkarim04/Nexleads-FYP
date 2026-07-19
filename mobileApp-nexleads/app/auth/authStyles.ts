import { StyleSheet } from 'react-native';

// Soft blue placeholder + cyan accents per the space theme.
export const PLACEHOLDER = '#ffffff';
export const ICON_IDLE = '#ffffff';
export const ICON_ACTIVE = '#ffffff';

/**
 * Auth-only styling: minimal underline inputs, white labels, a wide rounded
 * white primary button with dark text, and tight vertical rhythm so the whole
 * screen fits below the hero image without scrolling.
 */
export const authStyles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  // The shared ScrollView in AuthBackground owns keyboard scrolling; the form
  // just fills the space below the hero and centers its fields.
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 26,
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#b8c3ea',
    marginTop: 2,
    marginBottom: 22,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(159,192,238,0.4)',
    paddingBottom: 8,
  },
  inputLineFocused: {
    borderBottomColor: '#7cc7ff',
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: '#eaf0ff',
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 22,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(159,192,238,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#7cc7ff',
    borderColor: '#7cc7ff',
  },
  rememberText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#c8d6f4',
  },
  primaryBtn: {
    height: 52,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7cc7ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#021024',
    letterSpacing: 0.3,
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 18,
  },
  linkText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#ffffff',
  },
  linkDivider: {
    color: '#ffffff',
    fontSize: 13,
  },
});
