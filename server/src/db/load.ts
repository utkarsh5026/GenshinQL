import Character from "./models/Character";
import Nation from "./models/Nation";
import { repo } from "./utils";

export async function loadTalentBooksSchedule() {
  const nationRepo = repo(Nation);
  return await nationRepo.find({
    relations: [
      "talentMaterials",
      "talentMaterials.characters",
      "talentMaterials.characters.gallery.screenAnimation",
    ],
    select: {
      talentMaterials: {
        name: true,
        guideUrl: true,
        philosophyUrl: true,
        teachingUrl: true,
        dayOne: true,
        dayTwo: true,
        characters: {
          name: true,
          iconUrl: true,
          gallery: {
            id: true,
            screenAnimation: {
              idleTwo: true,
              idleOne: true,
            },
          },
        },
      },
    },
  });
}
export async function loadCharacters() {
  const characterRepo = repo(Character);
  return characterRepo.find({
    relations: ["element", "weaponType", "nation"],
  });
}
