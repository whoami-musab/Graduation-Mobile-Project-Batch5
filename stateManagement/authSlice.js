import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";

const express_url = process.env.EXPO_PUBLIC_BACKEND_EXPRESS_URL;

// ======================= Bootstrap Auth =======================
export const bootstrapAuth = createAsyncThunk(
  "auth/bootstrapAuth",
  async (_, thunkAPI) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      // const cachedUserRaw = AsyncStorage.getItem('userCache')
      // const cachedUser = cachedUserRaw ? JSON.parse(cachedUserRaw) : null

      if (!token) return { token: null, user: null, status: 'NO_TOKEN' };

      const res = await fetch(`${express_url}/auth/getUserData`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.status === 401 || res.status === 403) {
        await SecureStore.deleteItemAsync("authToken");
        return thunkAPI.rejectWithValue("UNAUTHORIZED");
      }
      
      const data = await res.json();
      if (!res.ok) {
        return thunkAPI.rejectWithValue(
          data.message || "Unknown error occurred. Please try again"
        );
      }

      return {
        token,
        user: data.user,
        status: 'AUTHENTICATED'
      };

    } catch (e) {
      console.log(e.message)
      return thunkAPI.rejectWithValue('SERVER_DOWN');
    }
  }
);

// ======================= Login =======================
export const login = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const res = await fetch(`${express_url}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (!res.ok) {
        return thunkAPI.rejectWithValue(
          data.message || "Unknown error occurred. Please try again"
        );
      }
      await SecureStore.setItemAsync("authToken", data.token);
      await AsyncStorage.setItem('userCache', JSON.stringify(data.user))
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// ======================= Register =======================
export const register = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      const res = await fetch(`${express_url}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (!res.ok) {
        return thunkAPI.rejectWithValue(
          data.message || "Unknown error occurred. Please try again"
        );
      }
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// ======================= Get User Data =======================
export const getUserData = createAsyncThunk(
  "auth/getUserData",
  async (_, thunkAPI) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) return thunkAPI.rejectWithValue("No authentication token found");
      
      const res = await fetch(`${express_url}/auth/getUserData`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.status === 401 || res.status === 403) {
        await SecureStore.deleteItemAsync("authToken");
        return thunkAPI.rejectWithValue("UNAUTHORIZED");
      }
      
      const data = await res.json();
      if (!res.ok) {
        return thunkAPI.rejectWithValue(
          data.message || "Unknown error occurred. Please try again"
        );
      }
      
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// ======================= Logout thunk =======================
export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async () => {
    await SecureStore.deleteItemAsync("authToken");
    return true
  }
  );

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    bootstraped: false,
    token: null,
    loading: false,
    error: null,
    registered: false,
    message: null,
    userData: null,
    authStatus: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
    // ======================= Bootstrap =======================
    .addCase(bootstrapAuth.pending, (state, action)=>{
      state.loading = true
      state.error = null
      state.authStatus = null
    })
    .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.bootstraped = true
        state.token = action.payload.token;
        state.isAuthenticated = action.payload.status === 'AUTHENTICATED';
        state.userData = action.payload.user
        state.authStatus = action.payload.status
    })
    .addCase(bootstrapAuth.rejected, (state, action) => {
      state.loading = false;
      state.bootstraped = true;
      state.error = action.payload || 'BOOTSTRAP_FAILED'
      if(action.payload === 'UNAUTHORIZED'){
        state.token = null
        state.userData = null
        state.isAuthenticated = false
        state.authStatus = 'LOGGED_OUT'
        return
      }
      if (action.payload === 'SERVER_DOWN') {
        state.token = null
        state.userData = null
        state.isAuthenticated = false
        state.authStatus = 'OFFLINE'
        return
      }
      state.authStatus = 'LOGGED_OUT'
    })
    // ======================= Login =======================
    .addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.authStatus = 'AUTHENTICATED'
      if(action.payload.user) state.userData = action.payload.user
    })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    // ======================= Register =======================
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.registered = true;
        state.message = action.payload.message;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ======================= Get User Data =======================
      .addCase(getUserData.pending, (state) => { // Pending
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserData.fulfilled, (state, action) => { // Fulfilled
        state.loading = false;
        state.userData = action.payload.user;
      })
      .addCase(getUserData.rejected, (state, action) => { // Rejected
        state.loading = false;
        state.error = action.payload;

        if (action.payload === "UNAUTHORIZED") {
          state.isAuthenticated = false;
          state.token = null;
          state.userData = null;
          state.authStatus = 'LOGGED_OUT'
        }
      })
      // ======================= Logout =======================
      .addCase(logoutThunk.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.error = null
        state.token = null;
        state.userData = null;
        state.authStatus = 'LOGGED_OUT'
      });
  },
});

export default authSlice.reducer;
