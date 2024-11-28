import { configureStore } from "@reduxjs/toolkit";
import charactersReducer from "./slices/characters";
import characterDetailedReducer from "./slices/character-detailed";
import talentBooksReducer from "./slices/talent-books";
import weaponsReducer from "./slices/weapons";
import weaponMaterialReducer from "./slices/weapon-material";
import genshinGuesserReducer from "./slices/genshin-guesser";

export const store = configureStore({
  reducer: {
    characters: charactersReducer,
    characterDetailed: characterDetailedReducer,
    talentBooks: talentBooksReducer,
    weapons: weaponsReducer,
    weaponMaterial: weaponMaterialReducer,
    genshinGuesser: genshinGuesserReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
