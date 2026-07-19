export const Colors = {
  // Light theme — mapped from the web dashboard (Dashboard.jsx + Tailwind).
  // These names are unchanged from the previous dark palette so every existing
  // reference keeps working; only the values flipped from dark to light.
  bg: '#EEF8FF', // app background (was deep navy)
  bg2: '#EEF8FF', // header / raised surface (web header bg)
  card: '#FFFFFF', // card surface
  text: '#111827', // primary text (gray-900)
  muted: '#6B7280', // secondary text (gray-500)
  primary: '#5F81AF', // accent / active (web bg-[#5F81AF])
  primary2: '#16304f', // deep navy accent (hero / circles)
  sidebar: '#EEF8FF',
  active: '#5F81AF',
  surface: '#EFF6FF', // content background (blue-50)
  danger: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',

  // "Glass" surfaces — now solid light surfaces with subtle gray borders.
  glassCard: '#FFFFFF',
  glassBorder: '#E5E7EB', // gray-200
  glassBorderFocus: '#5F81AF',
  glassInput: '#F3F6FB', // light input fill
  glassInputBorder: '#D8E2F0',
  glassModal: '#FFFFFF',
  glassOverlay: 'rgba(17,24,39,0.45)', // dim scrim behind modals
  whiteAlpha10: 'rgba(17,24,39,0.04)',
  whiteAlpha12: 'rgba(17,24,39,0.06)',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E7EB',

  // Platform colors
  upwork: '#14a800',
  linkedin: '#0077b5',
  freelancer: '#f7a32b',
  fiverr: '#1dbf73',

  // Light theme tokens — mapped from the web dashboard (Dashboard.jsx + Tailwind)
  // so dashboard surfaces can match its light look. The dark tokens above remain
  // the app default; only the dashboard screen opts into these.
  light: {
    bg: '#FFFFFF',
    headerBg: '#EEF8FF',
    contentBg: '#EFF6FF', // blue-50
    card: '#FFFFFF',
    cardBorder: '#E5E7EB', // gray-200
    heroFrom: '#2B4866', // navy hero card (Total Emails Sent tile)
    heroTo: '#16304f',
    circle: '#16304f', // dark funnel circles
    track: '#EEF2F7', // light progress track
    textPrimary: '#111827', // gray-900
    textBody: '#374151', // gray-700
    textMuted: '#6B7280', // gray-500
    textFaint: '#9CA3AF', // gray-400
    blue900: '#1E3A8A',
    blue300: '#93C5FD',
    // Segmented "Emails Breakdown" bar (dark -> mid -> light blue)
    seg1: '#1e3a5f',
    seg2: '#5F81AF',
    seg3: '#BBD4EC',
  },

  // Status badge colors — light tinted pills with darker text for legibility
  // on white cards.
  statusNew: { bg: '#E0EDFB', text: '#1e4e8c' },
  statusContacted: { bg: '#DCFCE7', text: '#15803d' },
  statusResponded: { bg: '#FEF3C7', text: '#b45309' },
  statusInDiscussion: { bg: '#EDE9FE', text: '#6d28d9' },
  statusOngoing: { bg: '#DBEAFE', text: '#1d4ed8' },
  statusCompleted: { bg: '#DCFCE7', text: '#15803d' },
  statusRejected: { bg: '#FEE2E2', text: '#b91c1c' },
} as const;
