import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Session } from 'next-auth';

interface UserState {
  user: Session['user'] | null;
}

const initialState: UserState = {
  user: null
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Session['user'] | null>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    }
  }
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;