import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  heroVisible: boolean;
}

const initialState: UIState = {
  heroVisible: true,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setHeroVisible: (state, action: PayloadAction<boolean>) => {
      state.heroVisible = action.payload;
    },
  },
});

export const { setHeroVisible } = uiSlice.actions;

export default uiSlice.reducer; 