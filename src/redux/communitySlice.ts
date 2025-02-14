// redux/slices/communitySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CommunityState {
  communityId: string | null;
  userId: string | null;
}

const initialState: CommunityState = {
  communityId: null,
  userId: null,
};

const communitySlice = createSlice({
  name: "community",
  initialState,
  reducers: {
    setCommunityData: (
      state,
      action: PayloadAction<{ communityId: string; userId: string }>
    ) => {
      state.communityId = action.payload.communityId;
      state.userId = action.payload.userId;
    },
    clearCommunityData: (state) => {
      state.communityId = null;
      state.userId = null;
    },
  },
});

export const { setCommunityData, clearCommunityData } = communitySlice.actions;
export default communitySlice.reducer;
