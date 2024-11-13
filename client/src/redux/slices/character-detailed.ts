import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CharacterDetailed } from "@/graphql/types";

interface CharacterDetailedState {
  currentCharacter: CharacterDetailed | null;
}

const initialState: CharacterDetailedState = {
  currentCharacter: null,
};

const characterDetailedSlice = createSlice({
  name: "characterDetailed",
  initialState,
  reducers: {
    setCurrentCharacter: (state, action: PayloadAction<CharacterDetailed>) => {
      state.currentCharacter = action.payload;
    },
  },
});

export const { setCurrentCharacter } = characterDetailedSlice.actions;
export default characterDetailedSlice.reducer;
