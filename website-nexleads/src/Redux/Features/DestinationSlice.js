import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseurl } from "../../BaseUrl";
import axios from "axios";

export const getDestinations = createAsyncThunk(
  "getDestinations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseurl}/getalldestinations`);
      const result = response.data;
      return result;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Thunk for posting a new destination
export const postDestination = createAsyncThunk(
  "postDestination",
  async (destinationData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${baseurl}/create-destination`,
        destinationData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const destinationsSlice = createSlice({
  name: "destinations",
  initialState: {
    AllDestinations: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDestinations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDestinations.fulfilled, (state, action) => {
        state.loading = false;
        state.AllDestinations = action.payload.destinations;
      })
      .addCase(getDestinations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(postDestination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postDestination.fulfilled, (state, action) => {
        state.loading = false;
        state.AllDestinations.push(action.payload);
      })
      .addCase(postDestination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default destinationsSlice.reducer;
