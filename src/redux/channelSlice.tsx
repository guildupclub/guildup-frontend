import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Channel {
  id: string;
  name: string;
}

interface ChannelState {
  activeChannel: Channel;
  activeCommunityId: string | null;
}

const initialState: ChannelState = {
  activeChannel: { id: "general", name: "General Chat" },
  activeCommunityId: null,
};

export const channelSlice = createSlice({
  name: "channel",
  initialState,
  reducers: {
    setActiveChannel: (state, action: PayloadAction<Channel>) => {
      state.activeChannel = action.payload;
    },
    setActiveCommunity: (state, action: PayloadAction<string>) => {
      state.activeCommunityId = action.payload;
    },
  },
});

export const { setActiveChannel, setActiveCommunity } = channelSlice.actions;
export default channelSlice.reducer;
