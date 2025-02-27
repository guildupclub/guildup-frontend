import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Session } from "next-auth";


interface Community {
  id: string;
  name: string;
}
interface UserState {
  user: Session["user"] | null; 
  sessionId: string | null;
  userFollowedCommunities: Community[]; 
}
const initialState: UserState = {
  user: null,
  sessionId: null, 
  userFollowedCommunities: [], 
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
    clearUser: (state) => {
      state.user = null;
      state.sessionId = null; // Clear sessionId when the user is cleared
      state.userFollowedCommunities = [];
    },
  },
});

export const { setUser, setSessionId, setUserFollowedCommunities, clearUser } = userSlice.actions;
export default userSlice.reducer;
