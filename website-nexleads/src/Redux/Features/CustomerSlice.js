import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseurl } from "../../BaseUrl";
import axios from "axios";

export const getCustomers = createAsyncThunk(
  "getCustomers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseurl}/getallcustomers`);
      const result = response.data;
      return result;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Thunk for posting a new destination
 

export const customerSlice = createSlice({
  name: "customer",
  initialState: {
    Customers: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.Customers = action.payload.Customers;
      })
      .addCase(getCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
  },
});

export default customerSlice.reducer;
