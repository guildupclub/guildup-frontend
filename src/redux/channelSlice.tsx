import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Channel {
  id: string;
  name: string;
}

interface ChannelState {
  activeChannel: Channel;
}

const initialState: ChannelState = {
  activeChannel: { id: 'general', name: 'General Chat' }
};

export const channelSlice = createSlice({
  name: 'channel',
  initialState,
  reducers: {
    setActiveChannel: (state, action: PayloadAction<Channel>) => {
      state.activeChannel = action.payload;
    }
  }
});

export const { setActiveChannel } = channelSlice.actions;
export default channelSlice.reducer;
