import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MemberDetails {
  _id: string;
  userId: string;
  communityId: string;
  role: string;
  joinedAt: string;
  status: string;
  isBanned: boolean;
  is_owner: boolean;
  is_moderator: boolean;
}

interface MemberState {
  memberDetails: MemberDetails | null;
  loading: boolean;
  error: string | null;
}

const initialState: MemberState = {
  memberDetails: null,
  loading: false,
  error: null,
};

const memberSlice = createSlice({
  name: 'member',
  initialState,
  reducers: {
    setMemberDetails: (state, action: PayloadAction<MemberDetails>) => {
      state.memberDetails = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearMemberDetails: (state) => {
      state.memberDetails = null;
    },
  },
});

export const { setMemberDetails, setLoading, setError, clearMemberDetails } = memberSlice.actions;
export default memberSlice.reducer;