import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import { baseurl, STRIPE_PUBLISHABLE_KEY } from '../../BaseUrl';


// Initialize Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// ==================== PROFILE MANAGEMENT ====================

// Update Personal Info (name, bio)
export const updatePersonalInfo = createAsyncThunk(
  'settings/updatePersonalInfo',
  async ({ name, bio }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseurl}/user/personal`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, bio }),
      });

      const result = await response.json();
      if (!response.ok) return rejectWithValue(result);

      toast.success('Profile updated successfully');
      return result;
    } catch (err) {
      toast.error('Failed to update profile');
      return rejectWithValue(err.message);
    }
  }
);

// Upload Profile Picture
export const uploadProfilePicture = createAsyncThunk(
  'settings/uploadProfilePicture',
  async (file, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch(`${baseurl}/user/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) return rejectWithValue(result);

      toast.success('Profile picture updated successfully');
      return result;
    } catch (err) {
      toast.error('Failed to upload profile picture');
      return rejectWithValue(err.message);
    }
  }
);

// Change Password
export const changePassword = createAsyncThunk(
  'settings/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseurl}/user/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const result = await response.json();
      if (!response.ok) return rejectWithValue(result);

      toast.success('Password changed successfully');
      return result;
    } catch (err) {
      toast.error('Failed to change password');
      return rejectWithValue(err.message);
    }
  }
);

// ==================== SUBSCRIPTION MANAGEMENT ====================

// Get Subscription Plans
export const getSubscriptionPlans = createAsyncThunk(
  'settings/getSubscriptionPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseurl}/user/plans`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (!response.ok) return rejectWithValue(result);

      return result;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Create Payment Intent (Step 1)
export const createPaymentIntent = createAsyncThunk(
  'settings/createPaymentIntent',
  async ({ plan, billingCycle }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseurl}/user/payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan, billingCycle }),
      });

      const result = await response.json();
      if (!response.ok) return rejectWithValue(result);

      return result;
    } catch (err) {
      toast.error('Failed to initialize payment');
      return rejectWithValue(err.message);
    }
  }
);

// Process Stripe Payment (Step 2) - This is called from component with Stripe Elements
export const confirmStripePayment = createAsyncThunk(
  'settings/confirmStripePayment',
  async ({ clientSecret, cardElement, stripe }, { rejectWithValue }) => {
    try {
      // Confirm card payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        const errorMessages = {
          'card_declined': 'Your card was declined. Please try another card.',
          'insufficient_funds': 'Insufficient funds. Please use another payment method.',
          'invalid_card_number': 'Invalid card number. Please check and try again.',
          'expired_card': 'Your card has expired. Please use a valid card.',
        };
        
        const errorMsg = errorMessages[error.code] || error.message || 'Payment failed';
        toast.error(errorMsg);
        return rejectWithValue({ code: error.code, message: errorMsg });
      }

      return paymentIntent;
    } catch (err) {
      toast.error('Payment processing failed');
      return rejectWithValue(err.message);
    }
  }
);

// Update Subscription (Step 3 - After successful payment)
export const updateSubscription = createAsyncThunk(
  'settings/updateSubscription',
  async ({ plan, paymentIntentId, billingCycle }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseurl}/user/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan, paymentIntentId, billingCycle }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.message || 'Failed to update subscription');
        return rejectWithValue(result);
      }

      toast.success(`Successfully upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan!`);
      return result;
    } catch (err) {
      toast.error('Failed to update subscription');
      return rejectWithValue(err.message);
    }
  }
);

// Get Subscription History
export const getSubscriptionHistory = createAsyncThunk(
  'settings/getSubscriptionHistory',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseurl}/user/subscription/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (!response.ok) return rejectWithValue(result);

      return result;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ==================== SLICE ====================

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    // Profile state
    profileLoading: false,
    profileError: null,
    
    // Password state
    passwordLoading: false,
    passwordError: null,
    
    // Subscription state
    plans: [],
    currentPlan: null,
    subscriptionHistory: [],
    subscriptionLoading: false,
    subscriptionError: null,
    
    // Payment state
    paymentIntent: null,
    clientSecret: null,
    paymentLoading: false,
    
    // Upload state
    uploadLoading: false,
    uploadProgress: 0,
  },
  reducers: {
    resetPasswordState: (state) => {
      state.passwordLoading = false;
      state.passwordError = null;
    },
    resetProfileState: (state) => {
      state.profileLoading = false;
      state.profileError = null;
    },
    resetPaymentState: (state) => {
      state.paymentIntent = null;
      state.clientSecret = null;
      state.paymentLoading = false;
    },
  },
  extraReducers: (builder) => {
    // Update Personal Info
    builder
      .addCase(updatePersonalInfo.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(updatePersonalInfo.fulfilled, (state) => {
        state.profileLoading = false;
      })
      .addCase(updatePersonalInfo.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
      });

    // Upload Profile Picture
    builder
      .addCase(uploadProfilePicture.pending, (state) => {
        state.uploadLoading = true;
      })
      .addCase(uploadProfilePicture.fulfilled, (state) => {
        state.uploadLoading = false;
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.uploadLoading = false;
        state.profileError = action.payload;
      });

    // Change Password
    builder
      .addCase(changePassword.pending, (state) => {
        state.passwordLoading = true;
        state.passwordError = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordLoading = false;
        state.passwordError = action.payload;
      });

    // Get Subscription Plans
    builder
      .addCase(getSubscriptionPlans.pending, (state) => {
        state.subscriptionLoading = true;
      })
      .addCase(getSubscriptionPlans.fulfilled, (state, action) => {
        state.subscriptionLoading = false;
        state.plans = action.payload.plans || [];
      })
      .addCase(getSubscriptionPlans.rejected, (state, action) => {
        state.subscriptionLoading = false;
        state.subscriptionError = action.payload;
      });

    // Create Payment Intent
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.paymentLoading = true;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.clientSecret = action.payload.clientSecret;
        state.paymentIntent = action.payload.paymentIntentId;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.paymentLoading = false;
        state.subscriptionError = action.payload;
      });

    // Confirm Stripe Payment
    builder
      .addCase(confirmStripePayment.pending, (state) => {
        state.subscriptionLoading = true;
      })
      .addCase(confirmStripePayment.fulfilled, (state) => {
        state.subscriptionLoading = false;
      })
      .addCase(confirmStripePayment.rejected, (state, action) => {
        state.subscriptionLoading = false;
        state.subscriptionError = action.payload;
      });

    // Update Subscription
    builder
      .addCase(updateSubscription.pending, (state) => {
        state.subscriptionLoading = true;
        state.subscriptionError = null;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.subscriptionLoading = false;
        state.currentPlan = action.payload.subscription;
        // Clear payment intent after successful subscription
        state.paymentIntent = null;
        state.clientSecret = null;
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.subscriptionLoading = false;
        state.subscriptionError = action.payload;
      });

    // Get Subscription History
    builder
      .addCase(getSubscriptionHistory.pending, (state) => {
        state.subscriptionLoading = true;
      })
      .addCase(getSubscriptionHistory.fulfilled, (state, action) => {
        state.subscriptionLoading = false;
        state.subscriptionHistory = action.payload.history || [];
      })
      .addCase(getSubscriptionHistory.rejected, (state, action) => {
        state.subscriptionLoading = false;
        state.subscriptionError = action.payload;
      });
  },
});

export const { resetPasswordState, resetProfileState, resetPaymentState } = settingsSlice.actions;
export default settingsSlice.reducer;