import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const MAX_GUESSES = 5;

interface GenshinGuesserState {
  guessedChars: string[];
  currentChar: string | null;
  gameOver: boolean;
  gameWon: boolean;
  streak: number;
}

const initialState: GenshinGuesserState = {
  guessedChars: [],
  currentChar: null,
  gameOver: false,
  gameWon: false,
  streak: 0,
};

const genshinGuesserSlice = createSlice({
  name: "genshinGuesser",
  initialState,
  reducers: {
    setVictory: (state) => {
      state.gameWon = true;
      state.gameOver = true;
      state.streak += 1;
    },

    setDefeat: (state) => {
      state.gameOver = true;
      state.gameWon = false;
      state.streak = 0;
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
        state.streak += 1;
      } else if (state.guessedChars.length === MAX_GUESSES) {
        state.gameOver = true;
        state.gameWon = false;
        state.streak = 0;
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
