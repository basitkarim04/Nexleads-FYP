import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';
import {
  Plan,
  SubscriptionRecord,
  CreateSubscriptionRequest,
  PaymentIntentRequest,
  PaymentIntentResponse,
} from '../../types/subscription.types';

interface SettingsState {
  plans: Plan[];
  subscriptionHistory: SubscriptionRecord[];
  clientSecret: string | null;
  // Stripe PaymentIntent id from createPaymentIntent. Required by
  // updateSubscription so the backend can verify the payment succeeded and
  // persist the new plan. Without it the backend rejects paid upgrades (400).
  paymentIntentId: string | null;
  plansLoading: boolean;
  historyLoading: boolean;
  paymentLoading: boolean;
  subscriptionLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  plans: [],
  subscriptionHistory: [],
  clientSecret: null,
  paymentIntentId: null,
  plansLoading: false,
  historyLoading: false,
  paymentLoading: false,
  subscriptionLoading: false,
  error: null,
};

export const fetchPlans = createAsyncThunk<Plan[]>(
  'settings/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/user/plans');
      return data.plans ?? data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createPaymentIntent = createAsyncThunk<PaymentIntentResponse, PaymentIntentRequest>(
  'settings/createPaymentIntent',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/user/payment-intent', payload);
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateSubscription = createAsyncThunk<{ message: string }, CreateSubscriptionRequest>(
  'settings/updateSubscription',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/user/subscription', payload);
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchSubscriptionHistory = createAsyncThunk<SubscriptionRecord[]>(
  'settings/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/user/subscription/history');
      return data.history ?? data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const cancelSubscription = createAsyncThunk<{ message: string }>(
  'settings/cancelSubscription',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/user/subscription/cancel');
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearClientSecret(state) {
      state.clientSecret = null;
      state.paymentIntentId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.plansLoading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.plansLoading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.plansLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createPaymentIntent.pending, (state) => {
        state.paymentLoading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.clientSecret = action.payload.clientSecret;
        state.paymentIntentId = action.payload.paymentIntentId;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.paymentLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateSubscription.pending, (state) => {
        state.subscriptionLoading = true;
        state.error = null;
      })
      .addCase(updateSubscription.fulfilled, (state) => {
        state.subscriptionLoading = false;
        state.clientSecret = null;
        state.paymentIntentId = null;
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.subscriptionLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSubscriptionHistory.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(fetchSubscriptionHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.subscriptionHistory = action.payload;
      })
      .addCase(fetchSubscriptionHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload as string;
      })
      .addCase(cancelSubscription.pending, (state) => {
        state.subscriptionLoading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state) => {
        state.subscriptionLoading = false;
        state.clientSecret = null;
        state.paymentIntentId = null;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.subscriptionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearClientSecret } = settingsSlice.actions;
export default settingsSlice.reducer;
