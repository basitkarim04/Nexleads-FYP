import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseurl } from "../../BaseUrl";
import axios from "axios";
import { retry } from "@reduxjs/toolkit/query";
import { toast } from "react-toastify";

export const getTours = createAsyncThunk(
  "getTours",

  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseurl}/getalltours`);
      const result = response.data;

      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const postTour = createAsyncThunk(
  "postTour",
  async (tourData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseurl}/create-tour`, tourData);
      return response.data; // Assuming the server returns the created tour data
    } catch (error) {
      return rejectWithValue(error.response.data); // Return the error response
    }
  }
);
export const getSingleTour = createAsyncThunk(
  "getSingleTour",

  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseurl}/getsingletour/${id}`);

      const result = response.data;

      return result;
    } catch (error) {
      rejectWithValue(error);
    }
  }
);




export const getToursbyName = createAsyncThunk(
  "getToursbyName",

  async (name, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseurl}/gettoursbydestination/${name}`);
      const result = response.data;

      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);






export const getToursbyNameAdmin = createAsyncThunk(
  "getToursbyNameAdmin",

  async (name, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseurl}/gettoursbydestinationadmin/${name}`);
      const result = response.data;

      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);





export const toursSlice = createSlice({
  name: "tours",
  initialState: {
    AllTours: [],
    loading: false,
    error: null,
    SingleTour: null,
    AllDestinationTours: [],
    success:false,

    AllDestinationToursNameAdmin: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTours.fulfilled, (state, action) => {
        state.loading = false;
        state.AllTours = action.payload.Tours;

      })
      .addCase(getTours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(postTour.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postTour.fulfilled, (state, action) => {
        state.loading = false;
        state.success= true;
        toast.success('Tour Uploaded Successfully')
      })
      .addCase(postTour.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload.error)
      })

      .addCase(getSingleTour.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getSingleTour.fulfilled, (state, action) => {
        state.loading = false;
        state.SingleTour = action.payload.TourDetails;
      })

      .addCase(getSingleTour.rejected, (state, action) => {
        state.error = action.payload.message;
      })




      .addCase(getToursbyName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getToursbyName.fulfilled, (state, action) => {
        state.loading = false;
        state.AllDestinationTours = action.payload.ToursbyName;
      })

      .addCase(getToursbyName.rejected, (state, action) => {
        state.error = action.payload.message;
      })






      // 

      .addCase(getToursbyNameAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getToursbyNameAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.AllDestinationToursNameAdmin = action.payload.ToursbyNameAdmin;
      })

      .addCase(getToursbyNameAdmin.rejected, (state, action) => {
        state.error = action.payload.message;
      })


  },
});

export default toursSlice.reducer;
