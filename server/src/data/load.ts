import path from "path";
import fs from "fs";
const BASE_DIR = path.join(__dirname, "..", "..", "data");
const CHARACTER_DIR = path.join(BASE_DIR, "characters");
const WEAPON_DIR = path.join(BASE_DIR, "weapons");

function loadCharacters() {
  const filePath = path.join(CHARACTER_DIR, "characters.json");
  const file = fs.readFileSync(filePath, "utf8");
  return JSON.parse(file);
}

export const characters = loadCharacters();
