import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Community {
  id: string;
  name: string;
  image: string;
  background_image: string;
  user_isBankDetailsAdded: boolean;
  user_iscalendarConnected: boolean;
}

interface Channel {
  id: string;
  name: string;
  type: "chat" | "discussion";
}

interface ChannelState {
  activeChannel: Channel;
  activeCommunity: Community | null;
}

const initialState: ChannelState = {
  activeChannel: { id: "general", name: "General Chat", type: "discussion" },
  activeCommunity: null,
};

export const channelSlice = createSlice({
  name: "channel",
  initialState,
  reducers: {
    setActiveChannel: (state, action: PayloadAction<Channel>) => {
      state.activeChannel = action.payload;
    },
    setActiveCommunity: (state, action: PayloadAction<Community>) => {
      state.activeCommunity = action.payload;
    },
    setUserBankDetails: (state, action: PayloadAction<boolean>) => {
      if (state.activeCommunity) {
        state.activeCommunity.user_isBankDetailsAdded = action.payload;
      }
    },
    setUserCalendarConnected: (state, action: PayloadAction<boolean>) => {
      if (state.activeCommunity) {
        state.activeCommunity.user_iscalendarConnected = action.payload;
      }
    },
  },
});

export const { setActiveChannel, setActiveCommunity, setUserBankDetails, setUserCalendarConnected } =
  channelSlice.actions;
export default channelSlice.reducer;
