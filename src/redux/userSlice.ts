import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Session } from 'next-auth';

interface UserState {
  user: any;
}

const initialState: UserState = {
  user: null
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      console.log("@actino.playload",action.payload)
      state.user = action.payload;
    },
  }
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;