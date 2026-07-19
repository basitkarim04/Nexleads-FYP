import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseurl } from '../../BaseUrl';

// Get token from localStorage
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Async thunk to fetch dashboard stats
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${baseurl}/admin/stats`,
        getAuthConfig()
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch dashboard stats'
      );
    }
  }
);

// Async thunk to fetch all users
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (searchQuery = '', { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${baseurl}/admin/users${searchQuery ? `?search=${searchQuery}` : ''}`,
        getAuthConfig()
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch users'
      );
    }
  }
);

// Async thunk to toggle user block status
export const toggleUserBlock = createAsyncThunk(
  'admin/toggleUserBlock',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${baseurl}/admin/users/${userId}/block`,
        {},
        getAuthConfig()
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to toggle user block status'
      );
    }
  }
);

// Async thunk to fetch single user details
export const fetchUserDetails = createAsyncThunk(
  'admin/fetchUserDetails',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${baseurl}/admin/users/${userId}`,
        getAuthConfig()
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user details'
      );
    }
  }
);

const initialState = {
  stats: {
    totalUsers: 0,
    totalLeads: 0,
    totalEarnings: 0
  },
  users: [],
  selectedUser: null,
  loading: false,
  statsLoading: false,
  usersLoading: false,
  error: null,
  success: false
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      })

      // Fetch All Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      })

      // Toggle User Block
      .addCase(toggleUserBlock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleUserBlock.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Update the user in the users array
        const index = state.users.findIndex(
          (user) => user.id === action.payload.userId
        );
        if (index !== -1) {
          state.users[index].blocked = action.payload.blocked;
        }
      })
      .addCase(toggleUserBlock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch User Details
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess, clearSelectedUser } = adminSlice.actions;

export default adminSlice.reducer;