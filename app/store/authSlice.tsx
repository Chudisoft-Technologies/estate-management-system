import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; role: string; email: string; username: string } | null;
}

const isClient = typeof window !== "undefined";
const userStored = isClient ? localStorage.getItem("user") : null;
const initialState: AuthState = {
  isAuthenticated: isClient
    ? localStorage.getItem("token")
      ? true
      : false
    : false,
  user: userStored !== null ? JSON.parse(userStored) : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(
      state,
      action: PayloadAction<{
        id: string;
        role: string;
        email: string;
        username: string;
      }>
    ) {
      console.log("Dispatching login with:", action.payload);
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
