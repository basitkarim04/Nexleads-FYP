import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';
import {
  Lead,
  LeadSearchParams,
  SaveLeadRequest,
  UpdateLeadStatusRequest,
  UpdateLeadInterestRequest,
} from '../../types/lead.types';

interface LeadState {
  leads: Lead[];
  searchResults: Lead[];
  selectedLead: Lead | null;
  searching: boolean;
  loading: boolean;
  error: string | null;
  totalLeads: number;
  currentPage: number;
}

export interface LeadSearchSummary {
  foundResults: number;
  withEmails: number;
  afterDateFilter: number;
  platforms?: Array<{
    platform: string;
    serpResults: number;
    withEmail: number;
    afterDateFilter: number;
    error?: string;
  }>;
}

export interface LeadSearchResponse {
  message?: string;
  fetched: number;
  saved: number;
  leads: Lead[];
  summary: LeadSearchSummary;
}

const initialState: LeadState = {
  leads: [],
  searchResults: [],
  selectedLead: null,
  searching: false,
  loading: false,
  error: null,
  totalLeads: 0,
  currentPage: 1,
};

function replaceLeadInList(list: Lead[], updatedLead: Lead) {
  const index = list.findIndex((lead) => lead._id === updatedLead._id);
  if (index !== -1) {
    list[index] = updatedLead;
  }
}

export const fetchMyLeads = createAsyncThunk<{ leads: Lead[]; total: number }>(
  'leads/fetchMyLeads',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/user/get-my-Leads');
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const searchLeads = createAsyncThunk<LeadSearchResponse, LeadSearchParams>(
  'leads/search',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/user/search', { params });
      const leads = data.leads ?? data;
      return {
        message: data.message,
        fetched: data.fetched ?? leads.length,
        saved: data.saved ?? leads.length,
        leads,
        summary: {
          foundResults: data.summary?.foundResults ?? data.fetched ?? leads.length,
          withEmails: data.summary?.withEmails ?? data.fetched ?? leads.length,
          afterDateFilter: data.summary?.afterDateFilter ?? data.fetched ?? leads.length,
          platforms: data.summary?.platforms,
        },
      };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const saveLead = createAsyncThunk<Lead, SaveLeadRequest>(
  'leads/save',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/user/save-lead', payload);
      return data.lead;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateLeadStatus = createAsyncThunk<
  Lead,
  { leadId: string; payload: UpdateLeadStatusRequest }
>(
  'leads/updateStatus',
  async ({ leadId, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/user/leads/${leadId}/status`, payload);
      return data.lead;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateLeadInterest = createAsyncThunk<
  Lead,
  { leadId: string; payload: UpdateLeadInterestRequest }
>(
  'leads/updateInterest',
  async ({ leadId, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/user/leads-interest/${leadId}`, payload);
      return data.lead;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearSearchResults(state) {
      state.searchResults = [];
    },
    setSelectedLead(state, action) {
      state.selectedLead = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload.leads;
        state.totalLeads = action.payload.total;
      })
      .addCase(fetchMyLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(searchLeads.pending, (state) => {
        state.searching = true;
        state.error = null;
      })
      .addCase(searchLeads.fulfilled, (state, action) => {
        state.searching = false;
        state.searchResults = action.payload.leads;
      })
      .addCase(searchLeads.rejected, (state, action) => {
        state.searching = false;
        state.error = action.payload as string;
      })
      .addCase(saveLead.fulfilled, (state, action) => {
        state.leads.unshift(action.payload);
      })
      .addCase(updateLeadStatus.fulfilled, (state, action) => {
        replaceLeadInList(state.leads, action.payload);
        replaceLeadInList(state.searchResults, action.payload);
        if (state.selectedLead?._id === action.payload._id) {
          state.selectedLead = action.payload;
        }
        state.error = null;
      })
      .addCase(updateLeadStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateLeadInterest.fulfilled, (state, action) => {
        replaceLeadInList(state.leads, action.payload);
        replaceLeadInList(state.searchResults, action.payload);
        if (state.selectedLead?._id === action.payload._id) {
          state.selectedLead = action.payload;
        }
        state.error = null;
      })
      .addCase(updateLeadInterest.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSearchResults, setSelectedLead } = leadSlice.actions;
export default leadSlice.reducer;
