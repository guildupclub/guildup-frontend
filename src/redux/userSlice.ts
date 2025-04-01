import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Session } from "next-auth";

interface Community {
  [x: string]: string | null;
  id: string;
  name: string;
}
interface UserState {
  user: Session["user"] | null;
  sessionId: string | null;
  userFollowedCommunities: Community[];
  isBankAdded: boolean;
  isCalendarConnected: boolean;
}
const initialState: UserState = {
  user: null,
  sessionId: null,
  userFollowedCommunities: [],
  isBankAdded: false,
  isCalendarConnected: false,
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
    setUserFollowedCommunities: (state, action: PayloadAction<Community[]>) => {
      state.userFollowedCommunities = action.payload; // Store user-followed communities
    },
    setIsBankAdded: (state, action: PayloadAction<boolean>) => {
      state.isBankAdded = action.payload;
    },
    setIsCalendarConnected: (state, action: PayloadAction<boolean>) => {
      state.isCalendarConnected = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.sessionId = null; // Clear sessionId when the user is cleared
      state.userFollowedCommunities = [];
      state.isBankAdded = false;
      state.isCalendarConnected = false;
    },
  },
});

export const {
  setUser,
  setSessionId,
  setUserFollowedCommunities,
  clearUser,
  setIsBankAdded,
  setIsCalendarConnected,
} = userSlice.actions;
export default userSlice.reducer;
