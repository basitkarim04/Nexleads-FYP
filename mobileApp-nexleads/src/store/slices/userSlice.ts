import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';
import { UserProfile, UpdatePersonalInfoRequest, ChangePasswordRequest } from '../../types/auth.types';
import { tokenStorage } from '../../utils/token';

export interface DashboardStats {
  stats: {
    totalLeads: number;
    totalEmailsSent: number;
    totalEmailsOpened: number;
    totalResponses: number;
  };
  funnelData: { stage: string; count: number }[];
  platformBreakdown: { platform: string; count: number }[];
  // Email breakdown percentages (sent / opened / responded), as on the web dashboard.
  emailBreakdown: { sent: number; opened: number; responded: number };
  recentProjects: { _id: string; title: string; status: string; company?: string }[];
  emailOpenRate: number;
}

interface UserState {
  profile: UserProfile | null;
  dashboardStats: DashboardStats | null;
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  dashboardStats: null,
  loading: false,
  statsLoading: false,
  error: null,
};

type UserProfilePatch = Partial<UserProfile> & { profilePicture?: string };

function mergeUserProfile(
  current: UserProfile | null | undefined,
  patch: UserProfilePatch | null | undefined
): UserProfile {
  if (!current && patch) {
    return patch as UserProfile;
  }
  return {
    ...(current as UserProfile),
    ...(patch ?? {}),
    subscription: {
      ...(current?.subscription ?? {}),
      ...(patch?.subscription ?? {}),
    } as UserProfile['subscription'],
  };
}

async function persistMergedUser(getState: () => unknown, patch: UserProfilePatch): Promise<UserProfile> {
  const state = getState() as { user?: UserState; auth?: { user: UserProfile | null } };
  const current = state.user?.profile ?? state.auth?.user ?? null;
  const merged = mergeUserProfile(current, patch);
  await tokenStorage.setUser(merged);
  return merged;
}

export const fetchDashboardStats = createAsyncThunk<DashboardStats>(
  'user/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/user/stats');
      // Normalize API shape → component shape
      const funnel = data.leadFunnel ?? {};
      return {
        stats: data.stats ?? {
          totalLeads: 0,
          totalEmailsSent: 0,
          totalEmailsOpened: 0,
          totalResponses: 0,
        },
        funnelData: [
          { stage: 'Leads', count: funnel.leads ?? 0 },
          { stage: 'Emails', count: funnel.emails ?? 0 },
          { stage: 'Responses', count: funnel.responses ?? 0 },
          { stage: 'Projects', count: funnel.projects ?? 0 },
        ],
        platformBreakdown: data.platformBreakdown ?? [],
        emailBreakdown: {
          sent: data.emailBreakdown?.sent ?? 0,
          opened: data.emailBreakdown?.opened ?? 0,
          responded: data.emailBreakdown?.responded ?? 0,
        },
        recentProjects: (data.activeProjects ?? []).map((p: any) => ({
          _id: p._id,
          title: p.title,
          status: p.status,
          company: p.company,
        })),
        emailOpenRate: data.emailBreakdown?.opened ?? 0,
      } as DashboardStats;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Fetches the full user document (including subscription usage), which the
// minimal login/auth payload does not contain.
export const fetchProfile = createAsyncThunk<UserProfile>(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/user/profile');

      return {
        ...data.user,
        subscription: {
          ...data.user.subscription,
          ...data.subscription,
        },
      };
      // return data.user;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updatePersonalInfo = createAsyncThunk<UserProfile, UpdatePersonalInfoRequest>(
  'user/updatePersonal',
  async (payload, { rejectWithValue, getState }) => {
    try {
      const { data } = await api.put('/user/personal', payload);
      return persistMergedUser(getState, data.user);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const changePassword = createAsyncThunk<{ message: string }, ChangePasswordRequest>(
  'user/changePassword',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/user/password', payload);
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const uploadProfilePicture = createAsyncThunk<UserProfile, FormData>(
  'user/uploadProfilePicture',
  async (formData, { rejectWithValue, getState }) => {
    try {
      const { data } = await api.post('/user/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return persistMergedUser(getState, data.user ?? { profilePicture: data.profilePicture });
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePersonalInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePersonalInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updatePersonalInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadProfilePicture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
