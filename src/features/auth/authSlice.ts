// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { loginUser, type LoginResponse } from "./authAPI";

interface AuthState {
  token: string | null;
  user: string | null;
  role: "admin" | "datacollector" | "transcriber" | "validator" | null;
  status: "idle" | "loading" | "failed" | "succeeded";
  error: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  user: localStorage.getItem("user"),
  role: (localStorage.getItem("role") as AuthState["role"]) ?? null,
  status: "idle",
  error: null,
};

export const loginAsync = createAsyncThunk(
  "auth/login",
  async ({ username, password }: { username: string; password: string }) => {
    const response: LoginResponse = await loginUser(username, password);
    return response;
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.role = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    },
    loadToken(state) {
      state.token = localStorage.getItem("token");
      state.user = localStorage.getItem("user");
      state.role = (localStorage.getItem("role") as AuthState["role"]) ?? null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        loginAsync.fulfilled,
        (state, action: PayloadAction<LoginResponse>) => {
          state.status = "succeeded";
          state.token = action.payload.access_token;
          state.user = action.payload.username;
          state.role = action.payload.role;
          localStorage.setItem("token", action.payload.access_token);
          localStorage.setItem("user", action.payload.username);
          localStorage.setItem("role", action.payload.role);
        }
      )
      .addCase(loginAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Login failed";
      });
  },
});

export const { logout, loadToken } = authSlice.actions;
export default authSlice.reducer;
