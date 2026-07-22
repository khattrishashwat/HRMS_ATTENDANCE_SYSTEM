import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UISliceState {
  isLoading: boolean;
  width: number;
  NotificationOpen: boolean;
}

const initialState: UISliceState = {
  isLoading: false,
  width: typeof window !== "undefined" ? window.innerWidth : 0,
  NotificationOpen: true,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    toggleNotification(state) {
      state.NotificationOpen = !state.NotificationOpen;
    },
  },
});

export const { setLoading, toggleNotification } = uiSlice.actions;
export default uiSlice.reducer;
