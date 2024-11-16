import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Character } from "@/graphql/types";
import type { ApolloError } from "@apollo/client";
interface CharactersState {
  characters: Character[];
  loading: boolean;
  error: ApolloError | null;
  characterMap: Record<string, Character>;
}

const initialState: CharactersState = {
  characters: [],
  loading: false,
  error: null,
  characterMap: {},
};

const charactersSlice = createSlice({
  name: "characters",
  initialState,
  reducers: {
    setCharacters: (state, action: PayloadAction<Character[]>) => {
      state.characters = action.payload;
      state.characterMap = action.payload.reduce(
        (acc, char) => {
          acc[char.name] = char;
          return acc;
        },
        {} as Record<string, Character>
      );
    },
  },
});

export const { setCharacters } = charactersSlice.actions;
export default charactersSlice.reducer;
