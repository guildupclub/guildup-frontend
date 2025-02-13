import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Community {
  id: string;
  name: string;
}

interface Channel {
  id: string;
  name: string;
}

interface ChannelState {
  activeChannel: Channel;
  activeCommunity: Community | null;
}

const initialState: ChannelState = {
  activeChannel: { id: "general", name: "General Chat" },
  activeCommunity: null,
};

export const channelSlice = createSlice({
  name: "channel",
  initialState,
  reducers: {
    setActiveChannel: (state, action: PayloadAction<Channel>) => {
      state.activeChannel = action.payload;
    },
    setActiveCommunity: (state, action: PayloadAction<Community>) => {  // ✅ Accepts an object
      state.activeCommunity = action.payload;
    },
  },
});

export const { setActiveChannel, setActiveCommunity } = channelSlice.actions;
export default channelSlice.reducer;
