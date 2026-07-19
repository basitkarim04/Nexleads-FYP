
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';
import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  UpdateProjectStatusRequest,
} from '../../types/project.types';

interface ProjectState {
  inDiscussion: Project[];
  ongoing: Project[];
  completed: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  inDiscussion: [],
  ongoing: [],
  completed: [],
  selectedProject: null,
  loading: false,
  error: null,
};

interface ProjectsGrouped {
  in_discussion: Project[];
  ongoing: Project[];
  completed: Project[];
}

export const fetchProjects = createAsyncThunk<ProjectsGrouped>(
  'projects/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/user/get-projects');
      // Backend returns { count, projects: { in_discussion, ongoing, completed } }
      return data.projects;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchProjectDetail = createAsyncThunk<Project, string>(
  'projects/fetchDetail',
  async (projectId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/user/get-project/${projectId}`);
      return data.project;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createProject = createAsyncThunk<Project, CreateProjectRequest>(
  'projects/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/user/create-project', payload);
      return data.project;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateProject = createAsyncThunk<
  Project,
  { projectId: string; payload: UpdateProjectRequest }
>(
  'projects/update',
  async ({ projectId, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/user/project-upset//${projectId}`, payload);
      return data.project;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateProjectStatus = createAsyncThunk<
  Project,
  { projectId: string; payload: UpdateProjectStatusRequest }
>(
  'projects/updateStatus',
  async ({ projectId, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/user/project/${projectId}/status`, payload);
      return data.project;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteProject = createAsyncThunk<string, string>(
  'projects/delete',
  async (projectId, { rejectWithValue }) => {
    try {
      await api.delete(`/user/project-del/${projectId}`);
      return projectId;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

function removeFromAll(state: ProjectState, id: string) {
  state.inDiscussion = state.inDiscussion.filter((p) => p._id !== id);
  state.ongoing = state.ongoing.filter((p) => p._id !== id);
  state.completed = state.completed.filter((p) => p._id !== id);
}

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setSelectedProject(state, action) {
      state.selectedProject = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.inDiscussion = action.payload.in_discussion ?? [];
        state.ongoing = action.payload.ongoing ?? [];
        state.completed = action.payload.completed ?? [];
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProjectDetail.fulfilled, (state, action) => {
        state.selectedProject = action.payload;
      })
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        const p = action.payload;
        removeFromAll(state, p._id);
        if (p.status === 'in_discussion') state.inDiscussion.unshift(p);
        else if (p.status === 'ongoing') state.ongoing.unshift(p);
        else state.completed.unshift(p);
        state.selectedProject = p;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const p = action.payload;
        removeFromAll(state, p._id);
        if (p.status === 'in_discussion') state.inDiscussion.unshift(p);
        else if (p.status === 'ongoing') state.ongoing.unshift(p);
        else state.completed.unshift(p);
        if (state.selectedProject?._id === p._id) state.selectedProject = p;
      })
      .addCase(updateProjectStatus.fulfilled, (state, action) => {
        const p = action.payload;
        removeFromAll(state, p._id);
        if (p.status === 'in_discussion') state.inDiscussion.unshift(p);
        else if (p.status === 'ongoing') state.ongoing.unshift(p);
        else state.completed.unshift(p);
        if (state.selectedProject?._id === p._id) state.selectedProject = p;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        removeFromAll(state, action.payload);
        if (state.selectedProject?._id === action.payload) state.selectedProject = null;
      });
  },
});

export const { clearError, setSelectedProject } = projectSlice.actions;
export default projectSlice.reducer;
