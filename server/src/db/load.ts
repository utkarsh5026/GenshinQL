import Character from "./models/Character";
import Nation from "./models/Nation";
import { repo } from "./utils";

/**
 * Loads the talent books schedule from the database.
 *
 * This function fetches the talent books schedule for all nations, including
 * the related talent materials and characters. The data is retrieved from the
 * Nation repository with specific relations and selected fields.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of nations with their talent books schedule.
 */
export async function loadTalentBooksSchedule(): Promise<Nation[]> {
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
