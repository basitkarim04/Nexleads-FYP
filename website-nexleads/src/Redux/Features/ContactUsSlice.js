import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseurl } from "../../BaseUrl";

export const sendEmail = createAsyncThunk(
  "contact/sendEmail",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseurl}/send-email`, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to send email");
    }
  }
);

const contactSlice = createSlice({
  name: "contact",
  initialState: {
    loading: false,
    success: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendEmail.pending, (state) => {
        state.loading = true;
        state.success = null;
        state.error = null;
      })
      .addCase(sendEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload;
      })
      .addCase(sendEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default contactSlice.reducer;
