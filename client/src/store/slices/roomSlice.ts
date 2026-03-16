import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface RoomUser {
  id: string;
  username: string;
}

interface RoomState {
  roomId: string | null;
  adminId: string | null;
  users: RoomUser[];
}

const initialState: RoomState = {
  roomId: null,
  adminId: null,
  users: [],
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRoom(state, action: PayloadAction<{ roomId: string; adminId: string }>) {
      state.roomId = action.payload.roomId;
      state.adminId = action.payload.adminId;
    },

    setUsers(state, action: PayloadAction<RoomUser[]>) {
      state.users = action.payload;
    },

    addUser(state, action: PayloadAction<RoomUser>) {
      const exists = state.users.some((user) => user.id === action.payload.id);

      if (!exists) {
        state.users.push(action.payload);
      }
    },

    removeUser(state, action: PayloadAction<string>) {
      state.users = state.users.filter((u) => u.id !== action.payload);
    },

    clearRoom(state) {
      state.roomId = null;
      state.users = [];
      state.adminId = null;
    },
  },
});

export const { setRoom, setUsers, addUser, removeUser, clearRoom } =
  roomSlice.actions;

export default roomSlice.reducer;
