import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Session } from "next-auth";

interface UserState {
  user: Session["user"] | null;
  sessionId: string | null; // Add sessionId to the state
}

const initialState: UserState = {
  user: null,
  sessionId: null, // Initialize sessionId as null
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Session["user"] | null>) => {
      state.user = action.payload;
    },
    setSessionId: (state, action: PayloadAction<string | null>) => {
      state.sessionId = action.payload; // Add sessionId to the state
    },
    clearUser: (state) => {
      state.user = null;
      state.sessionId = null; // Clear sessionId when the user is cleared
    },
  },
});

export const { setUser, setSessionId, clearUser } = userSlice.actions;
export default userSlice.reducer;
