import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Character } from "@/graphql/types";
import type { ApolloError } from "@apollo/client";
interface CharactersState {
  characters: Character[];
  loading: boolean;
  error: ApolloError | null;
}

const initialState: CharactersState = {
  characters: [],
  loading: false,
  error: null,
};

const charactersSlice = createSlice({
  name: "characters",
  initialState,
  reducers: {
    setCharacters: (state, action: PayloadAction<Character[]>) => {
      state.characters = action.payload;
    },
  },
});

export const { setCharacters } = charactersSlice.actions;
export default charactersSlice.reducer;
