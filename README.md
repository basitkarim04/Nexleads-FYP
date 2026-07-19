# NexLeads Mobile App - Completed Implementation Handoff

Last updated: 2026-06-24

This file is no longer a "build this mobile app" generation prompt.

The NexLeads mobile app has already been built inside:

```text
mobileApp-nexleads/
```

Use this document as the current implementation reference for what exists, how it is wired, and what should be checked before future changes. For the complete website and backend knowledge, keep using `Project Complete.md`.

---

## 1. Current Project State

NexLeads is now a three-part product:

| Area | Folder | Status |
|---|---|---|
| Backend API | `backend-nexleads/` | Built Express/MongoDB backend documented in `Project Complete.md` |
| Web app | `NexLeads/` | Built React/Vite web platform documented in `Project Complete.md` |
| Mobile app | `mobileApp-nexleads/` | Built Expo React Native mobile app documented here |

The mobile app is a production-style Expo Router app with auth, dashboard, leads, emails, projects, follow-ups, settings, subscriptions, and admin screens. It connects to the same backend API described in `Project Complete.md`.

---

## 2. Built Mobile Tech Stack

The original starter prompt requested Expo SDK 52, but the actual built app uses newer Expo SDK 54 packages.

| Concern | Built Technology |
|---|---|
| Framework | Expo `~54.0.0` |
| React Native | `0.81.5` |
| React | `19.1.0` |
| Language | TypeScript |
| Routing | Expo Router `~6.0.24` |
| State | Redux Toolkit + React Redux |
| HTTP | Axios with auth interceptors |
| Secure token storage | `expo-secure-store` |
| Payments | `@stripe/stripe-react-native` |
| Fonts | Poppins from `@expo-google-fonts/poppins` |
| Icons | `@expo/vector-icons` |
| Gestures/animation | `react-native-gesture-handler`, `react-native-reanimated`, `react-native-worklets` |
| Files/media | `expo-document-picker`, `expo-image-picker`, `expo-file-system` |
| Notifications dependency | `expo-notifications` installed |
| Network dependency | `@react-native-community/netinfo` installed |
| Socket dependency | `socket.io-client` installed and `useSocket` implemented |
| Build | EAS config for development, preview APK, and production APK |

---

## 3. Important Runtime Config

### API base URL

File:

```text
mobileApp-nexleads/src/config/api.ts
```

Current active API base:

```ts
export const BASE_URL = "http://192.168.100.20:5000/api";
```

The deployed Railway backend URL is present but commented:

```ts
// export const BASE_URL = "https://backend-nexleads-production.up.railway.app/api";
```

Before release or testing on another network, update `BASE_URL` to the correct reachable backend.

### Stripe publishable key

File:

```text
mobileApp-nexleads/app/_layout.tsx
```

The app wraps all routes in `StripeProvider` with a test publishable key.

### App identity

File:

```text
mobileApp-nexleads/app.json
```

Current values:

```text
name: NexLeads
slug: nexleads
scheme: nexleads
android package: com.nexleads.app
ios bundleIdentifier: com.nexleads.app
owner: basitkarim04
```

---

## 4. Built Folder Structure

Actual mobile app structure:

```text
mobileApp-nexleads/
  app/
    _layout.tsx
    index.tsx
    auth/
      _layout.tsx
      login.tsx
      signup.tsx
      verify-otp.tsx
      forgot-password.tsx
      reset-password.tsx
      authStyles.ts
    (app)/
      _layout.tsx
      dashboard/index.tsx
      leads/
        _layout.tsx
        index.tsx
        [leadId].tsx
      emails/
        _layout.tsx
        index.tsx
        compose.tsx
        [emailId].tsx
      projects/
        _layout.tsx
        index.tsx
        [projectId].tsx
      followups/index.tsx
      settings/
        _layout.tsx
        index.tsx
        profile.tsx
        password.tsx
        subscription.tsx
        privacy-policy.tsx
        terms-conditions.tsx
    admin/
      _layout.tsx
      index.tsx
      users.tsx
  src/
    assets/Images/
    components/
      admin/
      dashboard/
      emails/
      layout/
      leads/
      projects/
      ui/
    config/api.ts
    hooks/
      useAuth.ts
      useSocket.ts
      useToast.ts
    store/
      index.ts
      slices/
        authSlice.ts
        userSlice.ts
        leadSlice.ts
        emailSlice.ts
        projectSlice.ts
        followUpSlice.ts
        settingsSlice.ts
        adminSlice.ts
    theme/
      colors.ts
      typography.ts
      spacing.ts
      shadows.ts
    types/
      admin.types.ts
      auth.types.ts
      email.types.ts
      followup.types.ts
      lead.types.ts
      project.types.ts
      subscription.types.ts
    utils/
      formatters.ts
      token.ts
      validators.ts
  app.json
  babel.config.js
  eas.json
  package.json
  package-lock.json
  tsconfig.json
```

---

## 5. Root App Architecture

### Root layout

File:

```text
mobileApp-nexleads/app/_layout.tsx
```

Built behavior:

- Loads Poppins font weights.
- Prevents native splash from hiding too early.
- Shows custom animated splash through `AnimatedSplash`.
- Wraps the app with:
  - `GestureHandlerRootView`
  - Redux `Provider`
  - Stripe `StripeProvider`
  - Expo Router `Stack`
- Registers route groups:
  - `index`
  - `auth`
  - `(app)`
  - `admin`

### Startup redirect

File:

```text
mobileApp-nexleads/app/index.tsx
```

Built behavior:

- Dispatches `restoreSessionThunk`.
- If an existing token/user session is found:
  - Admin users route to `/admin`.
  - Normal users route to `/(app)/dashboard`.
- If no valid session exists, routes to `/auth/login`.

### Protected user tabs

File:

```text
mobileApp-nexleads/app/(app)/_layout.tsx
```

Built tabs:

| Tab | Route | Icon |
|---|---|---|
| Dashboard | `dashboard/index` | grid |
| Leads | `leads` | people |
| Emails | `emails` | mail |
| Projects | `projects` | folder |
| Follow-Ups | `followups/index` | time |
| Settings | `settings` | settings |

Built guard behavior:

- Reads token from secure storage and Redux auth state.
- Redirects unauthenticated users to `/auth/login`.
- Redirects admin users away from user tabs and into `/admin`.
- Shows email unread count as a tab badge.

### Admin stack

File:

```text
mobileApp-nexleads/app/admin/_layout.tsx
```

Built guard behavior:

- Redirects unauthenticated users to `/auth/login`.
- Redirects non-admin users to `/(app)/dashboard`.

---

## 6. Built State Management

File:

```text
mobileApp-nexleads/src/store/index.ts
```

Mounted Redux slices:

| Slice key | File | Purpose |
|---|---|---|
| `auth` | `authSlice.ts` | login, signup, OTP verify, forgot/reset password, profile restore, logout |
| `user` | `userSlice.ts` | user profile, dashboard stats, profile update, password change, profile picture upload |
| `leads` | `leadSlice.ts` | saved leads, lead search, save lead, status updates, interest updates |
| `emails` | `emailSlice.ts` | folders, compose/send, bulk email, draft, move, upsert, reply sync, AI assist |
| `projects` | `projectSlice.ts` | grouped projects, detail, create, update, status change, delete |
| `followUps` | `followUpSlice.ts` | follow-up lead list, lead interest update, send follow-up |
| `settings` | `settingsSlice.ts` | plans, payment intent, subscription update, history, cancel |
| `admin` | `adminSlice.ts` | admin stats, users, user detail, block/unblock |

The app uses `createAsyncThunk` for API actions and central Redux state for loading/error/result handling.

---

## 7. Built API Layer

File:

```text
mobileApp-nexleads/src/config/api.ts
```

Built behavior:

- Creates a shared Axios instance.
- Adds `Authorization: Bearer <token>` from `expo-secure-store`.
- Normalizes errors into `Error(message)`.
- Handles HTTP 401 by clearing stored auth and redirecting to `/auth/login`.
- Uses `timeout: 30000`.

Implemented endpoint groups include:

### Auth

```text
POST /user/login
POST /user/signup
POST /user/verify-email
POST /user/forgot-password
POST /user/reset-password/:token
GET  /user/profile
```

### Dashboard and profile

```text
GET  /user/stats
PUT  /user/personal
PUT  /user/password
POST /user/profile-picture
```

### Leads

```text
GET  /user/get-my-Leads
GET  /user/search
POST /user/save-lead
PUT  /user/leads/:leadId/status
PUT  /user/leads-interest/:leadId
```

### Emails and AI

```text
GET  /user/get-emails?folder=
POST /user/compose
POST /user/bulk
POST /user/draft
DELETE /user/email/:emailId
PUT  /user/move/:emailId
POST /user/upset-email
POST /user/check-replies
POST /user/ai-assist
```

Note: `DELETE /user/email/:emailId` is used by the mobile slice. Confirm that this route exists in the backend before relying on delete from mobile, because `Project Complete.md` lists folder movement but does not list that delete route.

### Projects

```text
GET    /user/get-projects
GET    /user/get-project/:projectId
POST   /user/create-project
PUT    /user/project-upset//:projectId
PUT    /user/project/:projectId/status
DELETE /user/project-del/:projectId
```

The double slash in `project-upset//:projectId` matches the current backend documentation.

### Follow-ups

```text
GET  /user/get-my-Leads
PUT  /user/leads-interest/:leadId
POST /user/:followUpId/send
```

### Subscription

```text
GET  /user/plans
POST /user/payment-intent
POST /user/subscription
GET  /user/subscription/history
POST /user/subscription/cancel
```

### Admin

```text
GET /admin/stats
GET /admin/users?search=
GET /admin/users/:userId
PUT /admin/users/:userId/block
```

---

## 8. Built Screens and Features

### Auth screens

Built files:

```text
app/auth/login.tsx
app/auth/signup.tsx
app/auth/verify-otp.tsx
app/auth/forgot-password.tsx
app/auth/reset-password.tsx
app/auth/authStyles.ts
```

Built features:

- Login with role-based redirect.
- Signup with OTP flow.
- OTP verification route.
- Forgot password request.
- Reset password form.
- Shared auth styling.
- Haptic feedback on auth actions.
- Auth background and animated splash support.

### Dashboard

Built file:

```text
app/(app)/dashboard/index.tsx
```

Built components:

```text
src/components/dashboard/MetricBento.tsx
src/components/dashboard/FunnelChart.tsx
src/components/dashboard/EmailsBreakdown.tsx
src/components/dashboard/RecentActivity.tsx
```

Built features:

- Fetches dashboard stats from `/user/stats`.
- Shows greeting, user avatar/profile image, user name, and NexLeads email.
- Pull-to-refresh.
- Metrics overview.
- Lead funnel section.
- Email breakdown section.
- Recent activity/projects section.
- Uses a light dashboard theme mapped from web dashboard colors.

### Leads

Built files:

```text
app/(app)/leads/index.tsx
app/(app)/leads/[leadId].tsx
src/components/leads/LeadCard.tsx
src/components/leads/LeadStatusBadge.tsx
src/components/leads/LeadInterestToggle.tsx
src/components/leads/SearchModal.tsx
```

Built features:

- Loads saved leads.
- Loads profile/subscription usage.
- Pull-to-refresh.
- Platform filter chips.
- Inline text search over lead fields.
- Date range filtering through `DatePickerModal`.
- Search modal for fetching new leads.
- Lead list with `FlatList`.
- Lead detail route.
- Per-lead email action.
- Bulk select and email selected leads.
- Lead interest toggle.
- Empty state when no leads match.

### Emails

Built files:

```text
app/(app)/emails/index.tsx
app/(app)/emails/compose.tsx
app/(app)/emails/[emailId].tsx
src/components/emails/EmailRow.tsx
src/components/emails/FolderTab.tsx
src/components/emails/ComposeForm.tsx
src/components/emails/AiAssistPanel.tsx
```

Built features:

- Folder tabs.
- Email list with pull-to-refresh.
- Email detail route.
- Compose screen.
- Single-lead and selected-leads compose modes.
- Draft saving for single-recipient compose.
- AI assist panel.
- Document picker UI for attachment names.
- Toast on draft save.
- Body editor and send flow through multipart `FormData`.

Important attachment note:

- `ComposeForm` currently stores selected attachment names in UI state.
- It does not append picked file assets to `FormData` yet.
- If real mobile attachment upload is required, append each selected document asset with `uri`, `name`, and `type`.

### Projects

Built files:

```text
app/(app)/projects/index.tsx
app/(app)/projects/[projectId].tsx
src/components/projects/ProjectCard.tsx
src/components/projects/StatusColumn.tsx
```

Built features:

- Loads grouped projects from backend.
- Project columns/status grouping.
- Pull-to-refresh.
- Project detail route.
- Create project flow from selected/available leads.
- Project update/status/delete API thunks exist in Redux.

### Follow-Ups

Built file:

```text
app/(app)/followups/index.tsx
```

Built features:

- Loads leads for follow-up workflow.
- Interest status updates for leads.
- Send follow-up thunk exists through `/user/:followUpId/send`.
- Follow-up UI uses list views, filters, and refresh controls.

### Settings

Built files:

```text
app/(app)/settings/index.tsx
app/(app)/settings/profile.tsx
app/(app)/settings/password.tsx
app/(app)/settings/subscription.tsx
app/(app)/settings/privacy-policy.tsx
app/(app)/settings/terms-conditions.tsx
```

Built features:

- Settings hub cards.
- Profile edit.
- Profile picture upload through `expo-image-picker`.
- Password change.
- Subscription plans.
- Stripe Payment Sheet integration.
- Subscription history.
- Cancel subscription thunk exists.
- Privacy policy page.
- Terms and conditions page.

### Admin

Built files:

```text
app/admin/index.tsx
app/admin/users.tsx
src/components/admin/StatCard.tsx
src/components/admin/UserRow.tsx
```

Built features:

- Admin dashboard stats.
- Pull-to-refresh.
- Admin users list.
- User search.
- Block/unblock user thunk.
- Admin route guard.

---

## 9. Built Shared UI and Layout System

Built UI components:

```text
src/components/ui/Avatar.tsx
src/components/ui/Badge.tsx
src/components/ui/BentoTile.tsx
src/components/ui/DatePickerModal.tsx
src/components/ui/EmptyState.tsx
src/components/ui/GlassCard.tsx
src/components/ui/GlassInput.tsx
src/components/ui/LoadingSpinner.tsx
src/components/ui/OutlineButton.tsx
src/components/ui/PrimaryButton.tsx
src/components/ui/ToastMessage.tsx
```

Built layout components:

```text
src/components/layout/AnimatedSplash.tsx
src/components/layout/AuthBackground.tsx
src/components/layout/KeyboardAwareWrapper.tsx
src/components/layout/ScreenWrapper.tsx
src/components/layout/SectionHeader.tsx
```

Built theme files:

```text
src/theme/colors.ts
src/theme/typography.ts
src/theme/spacing.ts
src/theme/shadows.ts
```

The app uses React Native `StyleSheet.create` throughout the inspected screens/components. It does not use Tailwind or NativeWind in the mobile app.

---

## 10. Built Types

Type files exist for the main backend data models and API payloads:

```text
src/types/auth.types.ts
src/types/lead.types.ts
src/types/email.types.ts
src/types/project.types.ts
src/types/followup.types.ts
src/types/subscription.types.ts
src/types/admin.types.ts
```

These types mirror the backend entities documented in `Project Complete.md`: user profile, subscription, leads, emails, projects, follow-ups, admin users, and plans.

---

## 11. Built Utilities and Hooks

Utilities:

```text
src/utils/token.ts
src/utils/formatters.ts
src/utils/validators.ts
```

Hooks:

```text
src/hooks/useAuth.ts
src/hooks/useSocket.ts
src/hooks/useToast.ts
```

Built behavior:

- `tokenStorage` wraps secure token/user storage.
- `useAuth` exposes auth state and logout behavior.
- `useSocket` connects to the backend Socket.IO host, emits `join` with the authenticated user id, and disconnects on cleanup.
- `useToast` powers custom toast feedback.

---

## 12. Build and Run Commands

From the mobile app folder:

```bash
cd mobileApp-nexleads
npm install
npm run start
```

Other scripts:

```bash
npm run android
npm run ios
npm run web
npm run lint
```

EAS build profiles:

```bash
eas build --profile development --platform android
eas build --profile preview --platform android
eas build --profile production --platform android
```

Preview and production are configured for APK output in `eas.json`.

---

## 13. Future Change Guidelines

When continuing development, do not treat this as a blank generation task. Work from the existing built app.

Follow this order:

1. Inspect the existing screen/component/slice first.
2. Preserve the current route structure unless the task explicitly changes navigation.
3. Keep API contracts aligned with `Project Complete.md` and backend route files.
4. Update TypeScript types, Redux thunks, and UI together when changing data shape.
5. Keep mobile styling in `StyleSheet.create`; do not introduce Tailwind/NativeWind.
6. Verify changes with TypeScript, lint/build, or a focused runtime check.
7. Before deployment, update `BASE_URL` away from the local LAN IP if needed.

---

## 14. Current Notes and Known Follow-Ups

These are not "things to build from scratch"; they are checkpoints for future hardening.

- `BASE_URL` currently points to `http://192.168.100.20:5000/api`, so real device testing requires the backend to be reachable at that LAN address.
- The Railway backend URL is already present in `api.ts` but commented.
- The mobile email delete thunk calls `DELETE /user/email/:emailId`; confirm backend support before exposing destructive delete UX.
- Document picker attachment UI exists, but selected files are not appended to compose `FormData` yet.
- Notification dependency is installed, but notification registration/listener behavior should be verified before claiming push notification support.
- NetInfo dependency is installed, but offline banner behavior should be verified before claiming full offline UX.
- Charting is implemented through custom dashboard components in the codebase, not through `victory-native` or `react-native-chart-kit` dependencies.
- The app uses Expo SDK 54 package versions, so future installs/builds should stay compatible with SDK 54 unless intentionally upgrading.

---

## 15. Completion Summary

The mobile application has been built with:

- Expo Router app structure.
- Auth and session restore.
- User protected tab navigation.
- Admin protected stack.
- Redux Toolkit store and slices.
- Axios API client with token injection and 401 handling.
- Dashboard overview.
- Lead search/list/detail/bulk email flow.
- Email folders, compose, drafts, AI assist, and detail screens.
- Project list/detail workflow.
- Follow-up workflow screen.
- Settings, profile, password, subscription, legal pages.
- Stripe Payment Sheet integration.
- Secure storage, custom toast, socket hook, reusable UI components, theme tokens, and TypeScript model types.

This file should now be used to understand what has already been built in `mobileApp-nexleads`, not as a prompt to generate a new app.
