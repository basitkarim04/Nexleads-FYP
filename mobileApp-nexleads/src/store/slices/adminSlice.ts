import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';
import { AdminStats, AdminUser, BlockUserRequest } from '../../types/admin.types';

interface AdminState {
  stats: AdminStats | null;
  users: AdminUser[];
  selectedUser: AdminUser | null;
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  stats: null,
  users: [],
  selectedUser: null,
  loading: false,
  statsLoading: false,
  error: null,
};

export const fetchAdminStats = createAsyncThunk<AdminStats>(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/stats');
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchAllUsers = createAsyncThunk<AdminUser[], { search?: string }>(
  'admin/fetchUsers',
  async ({ search } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/users', { params: { search } });
      return data.users ?? data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchUserDetail = createAsyncThunk<AdminUser, string>(
  'admin/fetchUserDetail',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/users/${userId}`);
      return data.user;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const toggleBlockUser = createAsyncThunk<
  AdminUser,
  { userId: string; payload: BlockUserRequest }
>(
  'admin/blockUser',
  async ({ userId, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/block`, payload);
      return data.user;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setSelectedUser(state, action) {
      state.selectedUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserDetail.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })
      .addCase(toggleBlockUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) state.users[index] = action.payload;
        if (state.selectedUser?._id === action.payload._id) {
          state.selectedUser = action.payload;
        }
      });
  },
});

export const { clearError, setSelectedUser } = adminSlice.actions;
export default adminSlice.reducer;
