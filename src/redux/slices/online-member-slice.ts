import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type InitialStateProps = {
  members: {
    id: string;
  }[];
};

const initialState: InitialStateProps = {
  members: [],
};

export const OnlineTracking = createSlice({
  name: 'online',
  initialState,
  reducers: {
    onOnline: (state, action: PayloadAction<InitialStateProps>) => {
      // check for duplicates
      const list = state.members.find((data: any) =>
        action.payload.members.find((payload: any) => payload.id === data.id)
      );

      if (!list) state.members = [...state.members, ...action.payload.members];
    },
    onOffline: (state, action: PayloadAction<InitialStateProps>) => {
      // look for member and remove them
      state.members = state.members.filter((member: any) =>
        action.payload.members.find((m: any) => m.id !== member.id)
      );
    },
  },
});

export const { onOnline, onOffline } = OnlineTracking.actions;

export default OnlineTracking.reducer;
