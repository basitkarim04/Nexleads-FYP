import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../config/api';
import {
  Email,
  EmailFolder,
  ComposeEmailRequest,
  BulkEmailRequest,
  DraftEmailRequest,
  AiAssistRequest,
  AiAssistResponse,
} from '../../types/email.types';

interface EmailState {
  emails: Email[];
  currentFolder: EmailFolder;
  selectedEmail: Email | null;
  loading: boolean;
  sending: boolean;
  aiLoading: boolean;
  aiContent: string;
  error: string | null;
  unreadCount: number;
}

const initialState: EmailState = {
  emails: [],
  currentFolder: 'inbox',
  selectedEmail: null,
  loading: false,
  sending: false,
  aiLoading: false,
  aiContent: '',
  error: null,
  unreadCount: 0,
};

export const fetchEmails = createAsyncThunk<Email[], { folder: EmailFolder }>(
  'emails/fetch',
  async ({ folder }, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/user/get-emails', { params: { folder } });
      return data.emails ?? data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Backend responds with { message, emailsSent: [...] } (one entry per recipient,
// so bulk sends return many). Return the array so the reducer can prepend all of
// them; single sends just yield a one-item array.
export const composeEmail = createAsyncThunk<Email[], FormData>(
  'emails/compose',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/user/compose', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const sent = data.emailsSent ?? (data.email ? [data.email] : []);
      return sent as Email[];
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const sendBulkEmail = createAsyncThunk<{ message: string }, BulkEmailRequest>(
  'emails/bulk',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/user/bulk', payload);
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const saveDraft = createAsyncThunk<Email, DraftEmailRequest>(
  'emails/draft',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/user/draft', payload);
      return data.draft;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteEmail = createAsyncThunk<Email, string>(
  'emails/delete',
  async (emailId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/user/email/${emailId}`);
      return data.email;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const moveEmail = createAsyncThunk<Email, { emailId: string; folder: EmailFolder }>(
  'emails/move',
  async ({ emailId, folder }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/user/move/${emailId}`, { folder });
      return data.email;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const upsertEmail = createAsyncThunk<Email, Partial<Email>>(
  'emails/upsert',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/user/upset-email', payload);
      return data.email;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const checkReplies = createAsyncThunk<{ message: string }>(
  'emails/checkReplies',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/user/check-replies');
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const getAiAssist = createAsyncThunk<AiAssistResponse, AiAssistRequest>(
  'emails/aiAssist',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/user/ai-assist', payload);
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const emailSlice = createSlice({
  name: 'emails',
  initialState,
  reducers: {
    setCurrentFolder(state, action: PayloadAction<EmailFolder>) {
      state.currentFolder = action.payload;
    },
    setSelectedEmail(state, action: PayloadAction<Email | null>) {
      state.selectedEmail = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    clearAiContent(state) {
      state.aiContent = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmails.fulfilled, (state, action) => {
        state.loading = false;
        state.emails = action.payload;
        state.unreadCount = action.payload.filter(
          (e) => !e.isRead && e.folder === 'inbox'
        ).length;
      })
      .addCase(fetchEmails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(composeEmail.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(composeEmail.fulfilled, (state, action) => {
        state.sending = false;
        // action.payload is an array (one entry per recipient). Prepend the
        // valid ones so both single and bulk sends update the list.
        const sent = (action.payload ?? []).filter(Boolean);
        if (sent.length) state.emails.unshift(...sent);
      })
      .addCase(composeEmail.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload as string;
      })
      .addCase(saveDraft.fulfilled, (state, action) => {
        state.emails.unshift(action.payload);
      })
      .addCase(deleteEmail.fulfilled, (state, action) => {
        const index = state.emails.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) state.emails.splice(index, 1);
      })
      .addCase(moveEmail.fulfilled, (state, action) => {
        const index = state.emails.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) state.emails.splice(index, 1);
      })
      .addCase(getAiAssist.pending, (state) => {
        state.aiLoading = true;
        state.aiContent = '';
      })
      .addCase(getAiAssist.fulfilled, (state, action) => {
        state.aiLoading = false;
        // Backend returns { subject?, body } with body as HTML. The compose
        // editor is plain text, so strip tags and decode the few common
        // entities GPT tends to emit. (Previously this read payload.content,
        // which doesn't exist → AI result was always empty.)
        const html = action.payload.body ?? '';
        state.aiContent = html
          .replace(/<\s*br\s*\/?>/gi, '\n')
          .replace(/<\/\s*p\s*>/gi, '\n\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
      })
      .addCase(getAiAssist.rejected, (state, action) => {
        state.aiLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentFolder, setSelectedEmail, clearError, clearAiContent } = emailSlice.actions;
export default emailSlice.reducer;
