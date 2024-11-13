import { configureStore } from "@reduxjs/toolkit";
import charactersReducer from "./slices/characters";
import characterDetailedReducer from "./slices/character-detailed";

export const store = configureStore({
  reducer: {
    characters: charactersReducer,
    characterDetailed: characterDetailedReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
