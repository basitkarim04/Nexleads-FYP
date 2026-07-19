
/**
 * REFACTORED: Mirrors UserDetailSlice.js (JobLeads + updateLeadInterest pattern)
 *
 * REMOVED:
 *   - fetchFollowUps (was hitting /followUp-stats and treating records as aggregated objects)
 *   - fetchFollowUpStats (was hitting /followUp-stats for a separate stats object)
 *   - createFollowUp (was creating backend follow-up records — no longer needed)
 *   - recordFollowUp (was posting to /followUp-record)
 *   - updateFollowUp (was patching /followups/:id)
 *   - FollowUpStats, FollowUp types from followup.types — replaced with Lead from lead.types
 *   - followUps[], stats state fields
 *
 * REPLACED WITH:
 *   - fetchLeadsForFollowUp: GET /user/get-my-Leads → stores raw leads[]
 *     (mirrors: JobLeads → state.userLeads in UserDetailSlice)
 *   - updateLeadInterest: PUT /user/leads-interest/:leadId
 *     (mirrors: updateLeadInterest in UserDetailSlice / leadSlice)
 *   - sendFollowUp: POST /user/:followUpId/send (kept, was already correct)
 *
 * All grouping, stats, and card generation is done in index.tsx via useMemo,
 * exactly like DashboardTask.jsx computes leadsByJobField from userLeads.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';
import { Lead } from '../../types/lead.types';

interface SendFollowUpPayload {
  subject: string;
  body: string;
  leadIds?: string[];
}

interface FollowUpState {
  leads: Lead[];
  loading: boolean;
  sending: boolean;
  error: string | null;
}

const initialState: FollowUpState = {
  leads: [],
  loading: false,
  sending: false,
  error: null,
};

// Mirrors: JobLeads in UserDetailSlice.js → GET /user/get-my-Leads
export const fetchLeadsForFollowUp = createAsyncThunk<{ leads: Lead[]; total: number }>(
  'followUps/fetchLeads',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/user/get-my-Leads');
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Mirrors: updateLeadInterest in UserDetailSlice.js → PUT /user/leads-interest/:leadId
export const updateLeadInterest = createAsyncThunk<
  Lead,
  { leadId: string; interest: 'interested' | 'not_interested' }
>(
  'followUps/updateInterest',
  async ({ leadId, interest }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/user/leads-interest/${leadId}`, { interest });
      return data.lead;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Kept from original — sends follow-up email for one or multiple leads
export const sendFollowUp = createAsyncThunk<
  { message: string },
  { followUpId: string; payload: SendFollowUpPayload }
>(
  'followUps/send',
  async ({ followUpId, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/user/${followUpId}/send`, payload);
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const followUpSlice = createSlice({
  name: 'followUps',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchLeadsForFollowUp — mirrors JobLeads handlers in UserDetailSlice
      .addCase(fetchLeadsForFollowUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeadsForFollowUp.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload.leads ?? [];
      })
      .addCase(fetchLeadsForFollowUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // updateLeadInterest — optimistic-style: patch the lead in place without reload
      .addCase(updateLeadInterest.fulfilled, (state, action) => {
        const index = state.leads.findIndex((l) => l._id === action.payload._id);
        if (index !== -1) state.leads[index] = action.payload;
      })

      // sendFollowUp
      .addCase(sendFollowUp.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendFollowUp.fulfilled, (state) => {
        state.sending = false;
      })
      .addCase(sendFollowUp.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = followUpSlice.actions;
export default followUpSlice.reducer;
