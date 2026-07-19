import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
 
import { toast } from "react-toastify";
import axios from "axios";
import { baseurl } from "../../BaseUrl";
 

export const addOrder = createAsyncThunk(
    "addorder",
    async (credentials, { rejectWithValue }) => {
      try {
        const response = await axios.post(`${baseurl}/create-order`, credentials, {
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        // Axios automatically parses the response data, so no need to call `.json()`
        return response.data;
      } catch (error) {
        // Check if error response exists and extract error message
        if (error.response) {
          // Server responded with a status code other than 2xx
          const errorData = error.response.data;
          return rejectWithValue(errorData || "Something went wrong");
        } else if (error.request) {
          // Request was made but no response received
          return rejectWithValue("Network error occurred");
        } else {
          // Something else went wrong in setting up the request
          return rejectWithValue(error.message || "Something went wrong");
        }
      }
    }
  );


  export const SingleOrder = createAsyncThunk(
    "singleorder",
    async (args, { rejectWithValue }) => {
      const response = await fetch(
        `${baseurl}/getorderdetails/${args}`
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


  export const allOrders = createAsyncThunk(
    "allorders",
    async (credentials, { rejectWithValue }) => {
      try {
        const response = await fetch(`${baseurl}/getallbookings`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
          
        });
  
        // Check if the response status is not ok (like 400 or 500 status codes)
        if (!response.ok) {
          // Extract the error message from the response body
          const errorData = await response.json();
          return rejectWithValue(errorData || "Something went wrong");
        }
  
        const data = await response.json();
        return data;
      } catch (error) {
        // Handle network errors or unexpected errors
        return rejectWithValue(error.message || "Network error occurred");
      }
    }
  );
  



  export const updateorder = createAsyncThunk(
    "updateorder",
    async (credentials, { rejectWithValue }) => {
      try {
        const response = await fetch(`${baseurl}/update-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        });
  
        // Check if the response status is not ok (like 400 or 500 status codes)
        if (!response.ok) {
          // Extract the error message from the response body
          const errorData = await response.json();
          return rejectWithValue(errorData || "Something went wrong");
        }
  
        const data = await response.json();
        return data;
      } catch (error) {
        // Handle network errors or unexpected errors
        return rejectWithValue(error.message || "Network error occurred");
      }
    }
  );





  export const ordersbyEmail = createAsyncThunk(
    "ordersbyemail",
    async (args, { rejectWithValue }) => {
      const response = await fetch(
        `${baseurl}/ordersbyemail/${args}`
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





  // Define your slice
export const addorderSlice = createSlice({
    name: "order",
    initialState: {
      orderDetails:null,
      
      singleOrderDetails:null,

      allOrders:[],

      emailOrders:[]
  
     
    },
    reducers: {
      logout: (state) => {
        state.user = null;
        localStorage.removeItem("user");
      },
    },
    extraReducers: (builder) => {
      builder
         
       
  
  
        .addCase(addOrder.pending, (state) => {
          state.loading = true;
        })
        .addCase(addOrder.fulfilled, (state, action) => {
          state.loading = false;
          state.getbrandreview = action.payload;
        })
        .addCase(addOrder.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
  



        .addCase(SingleOrder.pending, (state) => {
          state.loading = true;
        })
        .addCase(SingleOrder.fulfilled, (state, action) => {
          state.loading = false;
          state.singleOrderDetails = action.payload.orderDetails;
        })
        .addCase(SingleOrder.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })





        .addCase(allOrders.pending, (state) => {
          state.loading = true;
        })
        .addCase(allOrders.fulfilled, (state, action) => {
          state.loading = false;
          state.allOrders = action.payload.Bookings;
        })
        .addCase(allOrders.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })



        .addCase(updateorder.pending, (state) => {
          state.loading = true;
        })
        .addCase(updateorder.fulfilled, (state, action) => {
          state.loading = false;
        
        })
        .addCase(updateorder.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })





        .addCase(ordersbyEmail.pending, (state) => {
          state.loading = true;
        })
        .addCase(ordersbyEmail.fulfilled, (state, action) => {
          state.loading = false;
          state.emailOrders= action.payload.Orders
        })
        .addCase(ordersbyEmail.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
  
  
  
        
  
       
    },
  });
  
  // Export actions and reducers
  export const { logout } = addorderSlice.actions;
  export default addorderSlice.reducer;

