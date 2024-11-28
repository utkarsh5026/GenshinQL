import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const MAX_GUESSES = 5;

interface GenshinGuesserState {
  guessedChars: string[];
  currentChar: string | null;
  gameOver: boolean;
  gameWon: boolean;
}

const initialState: GenshinGuesserState = {
  guessedChars: [],
  currentChar: null,
  gameOver: false,
  gameWon: false,
};

const genshinGuesserSlice = createSlice({
  name: "genshinGuesser",
  initialState,
  reducers: {
    setVictory: (state) => {
      state.gameWon = true;
      state.gameOver = true;
    },

    setDefeat: (state) => {
      state.gameOver = true;
      state.gameWon = false;
    },

    setCurrentChar: (state, action: PayloadAction<string>) => {
      state.currentChar = action.payload;
    },

    addGuessedChar: (state, action: PayloadAction<string>) => {
      const guessedChar = action.payload;
      state.guessedChars = [...state.guessedChars, guessedChar];

      if (guessedChar === state.currentChar) {
        state.gameWon = true;
        state.gameOver = true;
      } else if (state.guessedChars.length === MAX_GUESSES) {
        state.gameOver = true;
        state.gameWon = false;
      }
    },

    resetGame: (state) => {
      state.guessedChars = [];
      state.currentChar = null;
      state.gameOver = false;
      state.gameWon = false;
    },
  },
});

export const {
  setVictory,
  setDefeat,
  setCurrentChar,
  addGuessedChar,
  resetGame,
} = genshinGuesserSlice.actions;
export default genshinGuesserSlice.reducer;
