import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseurl } from "../../BaseUrl";
import { toast } from "react-toastify";

//create action
export const createUser = createAsyncThunk(
  "createUser",
  async (data, { rejectWithValue }) => {
    console.log("data", data);
    const response = await fetch(
      "https://641dd63d945125fff3d75742.mockapi.io/crud",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    try {
      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

//delete action
export const deleteUser = createAsyncThunk(
  "deleteUser",
  async (id, { rejectWithValue }) => {
    const response = await fetch(
      `https://641dd63d945125fff3d75742.mockapi.io/crud/${id}`,
      { method: "DELETE" }
    );

    try {
      const result = await response.json();
      console.log(result);
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

//update action
export const updateUser = createAsyncThunk(
  "updateUser",
  async (data, { rejectWithValue }) => {
    console.log("updated data", data);
    const response = await fetch(
      `https://641dd63d945125fff3d75742.mockapi.io/crud/${data.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    try {
      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// create-signup

//create action
export const signup = createAsyncThunk(
  "signup",
  async (data, { rejectWithValue }) => {
    console.log("data", data);
    const response = await fetch(
      `${baseurl}/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    try {
      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

//read action
export const userData = createAsyncThunk(
  "userData",
  async (args, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseurl}/user/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      const data = result.user;

      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
export const DashboardStats = createAsyncThunk(
  "DashboardStats",
  async (args, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseurl}/user/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const searchLeads = createAsyncThunk(
  "searchLeads",
  async ({ keyword, platforms, dateFrom, dateTo }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const query = new URLSearchParams({
        keyword,
        platforms: platforms.join(','),
        dateFrom,
        dateTo,
      }).toString();

      const response = await fetch(
        `${baseurl}/user/search?${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result);
      }

      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const JobLeads = createAsyncThunk(
  "JobLeads",
  async (args, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseurl}/user/get-my-Leads`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getEmails = createAsyncThunk(
  "getEmails",
  async (folder, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseurl}/user/get-emails?folder=${folder}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Redux Feature / Slice
export const sendEmails = createAsyncThunk(
  'sendEmails',
  async ({ subject, body, attachments, leadIds }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('body', body);
      formData.append('leadIds', JSON.stringify(leadIds));

      attachments.forEach((file) => formData.append('attachments', file));

      const response = await fetch(`${baseurl}/user/compose`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) return rejectWithValue(result);
      toast.success("Emails send successfully")
      return result;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
export const upsetEmail = createAsyncThunk(
  'upsetEmail',
  async (payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseurl}/user/upset-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) return rejectWithValue(result);
      toast.success("Email send successfully")
      return result;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
export const moveFolderEmail = createAsyncThunk(
  'moveFolderEmail',
  async (payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseurl}/user/move/${payload.emailId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ folder: payload.folder }),
      });

      const result = await response.json();

      if (!response.ok) return rejectWithValue(result);
      toast.success("Moved to trash")
      return result;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createProject = createAsyncThunk(
  'createProject',
  async (payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseurl}/user/create-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) return rejectWithValue(result);
      toast.success("Project Marked")
      return result;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getProjects = createAsyncThunk(
  "getProjects",
  async (args, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseurl}/user/get-projects`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateProject = createAsyncThunk(
  'updateProject',
  async ({ projectId, status }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseurl}/user/project/${projectId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }), // Sending status in body
      });

      const result = await response.json();
      if (!response.ok) return rejectWithValue(result);

      toast.success(`Project updated to ${status}`);
      return result;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
export const updateLeadInterest = createAsyncThunk(
  'updateLeadInterest',
  async ({ leadId, interest }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseurl}/user/leads-interest/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ interest }), // Sending status in body
      });

      const result = await response.json();
      if (!response.ok) return rejectWithValue(result);

      toast.success(`Lead Status updated to ${interest}`);
      return result;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const aiEmailAssist = createAsyncThunk(
  "aiEmailAssist",
  async (payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${baseurl}/user/ai-assist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data);

      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);


export const userDetail = createSlice({
  name: "userDetail",
  initialState: {
    userDetails: null,
    dashboardStats: null,
    userLeads: null,
    userEmails: null,
    userProjects: null,
    users: [],
    loading: false,
    error: null,
    searchData: [],
  },
  reducers: {
    searchUser: (state, action) => {
      console.log(action.payload);
      state.searchData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(userData.pending, (state) => {
        state.loading = true;
      })
      .addCase(userData.fulfilled, (state, action) => {
        state.loading = false;
        state.userDetails = action.payload;
      })
      .addCase(userData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(DashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(DashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(DashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(searchLeads.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchLeads.fulfilled, (state, action) => {
        state.loading = false;
        toast.success("Leads Fetched Successfully..")
      })
      .addCase(searchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error("Error:", action.payload.message)
      })
      .addCase(JobLeads.pending, (state) => {
        state.loading = true;
      })
      .addCase(JobLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.userLeads = action.payload;
      })
      .addCase(JobLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendEmails.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendEmails.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(sendEmails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getEmails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEmails.fulfilled, (state, action) => {
        state.loading = false;
        state.userEmails = action.payload;
      })
      .addCase(getEmails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.userProjects = action.payload;
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        const { id } = action.payload;
        if (id) {
          state.users = state.users.filter((ele) => ele.id !== id);
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.map((ele) =>
          ele.id === action.payload.id ? action.payload : ele
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
  },
});

export const { searchUser } = userDetail.actions;

export default userDetail.reducer;
