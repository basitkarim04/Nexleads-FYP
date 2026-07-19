import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../config/api';
import { tokenStorage } from '../../utils/token';
import {
  UserProfile,
  LoginRequest,
  SignupRequest,
  VerifyOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
} from '../../types/auth.types';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isLoading: false,
  error: null,
};

export const loginThunk = createAsyncThunk<AuthResponse, LoginRequest>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post<AuthResponse>('/user/login', credentials);
      await tokenStorage.setToken(data.token);
      await tokenStorage.setUser(data.user);
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const signupThunk = createAsyncThunk<{ message: string }, SignupRequest>(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    console.log('Signup data:', userData);
    try {
      const { data } = await api.post('/user/signup', userData);
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const verifyOtpThunk = createAsyncThunk<AuthResponse, VerifyOtpRequest>(
  'auth/verifyOtp',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post<AuthResponse>('/user/verify-email', payload);
      await tokenStorage.setToken(data.token);
      await tokenStorage.setUser(data.user);
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const forgotPasswordThunk = createAsyncThunk<{ message: string }, ForgotPasswordRequest>(
  'auth/forgotPassword',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/user/forgot-password', payload);
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const resetPasswordThunk = createAsyncThunk<{ message: string }, ResetPasswordRequest>(
  'auth/resetPassword',
  async ({ token, password, confirmPassword }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/user/reset-password/${token}`, {
        password,
        confirmPassword,
      });
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchProfileThunk = createAsyncThunk<UserProfile>(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<{ user: UserProfile }>('/user/profile');
      return data.user;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await tokenStorage.clearAll();
});

export const restoreSessionThunk = createAsyncThunk<{ token: string; user: UserProfile } | null>(
  'auth/restoreSession',
  async () => {
    const token = await tokenStorage.getToken();
    const userJson = await tokenStorage.getUser();
    if (token && userJson) {
      const user = JSON.parse(userJson) as UserProfile;
      return { token, user };
    }
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    updateUser(state, action: PayloadAction<Partial<UserProfile>>) {
      state.user = state.user
        ? {
            ...state.user,
            ...action.payload,
            subscription: {
              ...state.user.subscription,
              ...action.payload.subscription,
            },
          }
        : (action.payload as UserProfile);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(signupThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(signupThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyOtpThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtpThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(forgotPasswordThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPasswordThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(resetPasswordThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPasswordThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.error = null;
      })
      .addCase(restoreSessionThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
