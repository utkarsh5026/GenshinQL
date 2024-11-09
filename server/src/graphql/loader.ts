import DataLoader from "dataloader";
import { loadTalentBooksSchedule, loadCharacters } from "../db/load";

/**
 * DataLoader for fetching talent books schedule.
 *
 * This DataLoader batches and caches requests to load talent books schedule
 * based on the provided keys. It supports fetching all talent books data
 * when the key "all" is used.
 */
export const talentBooksLoader = new DataLoader(async (keys) => {
  const talentMaterials = await loadTalentBooksSchedule();

  // Map each key to the corresponding value
  return keys.map((key) => {
    if (key === "all") {
      return talentMaterials.map((nation) => {
        const { name, talentMaterials } = nation;
        const days = talentMaterials.map((mat) => {
          const {
            name,
            guideUrl,
            philosophyUrl,
            teachingUrl,
            dayOne,
            dayTwo,
            characters,
          } = mat;
          return {
            day: `${dayOne}  ${dayTwo}`,
            books: [
              {
                name: `Philosophies of ${name}`,
                url: philosophyUrl,
              },
              {
                name: `Guide of ${name}`,
                url: guideUrl,
              },
              {
                name: `Teaching of ${name}`,
                url: teachingUrl,
              },
            ],
            characters: characters.map((char) => {
              const { name, gallery } = char;
              let iconUrl = char.iconUrl;

              if (gallery?.screenAnimation?.idleOne)
                iconUrl = gallery.screenAnimation.idleOne;

              return {
                name,
                url: iconUrl,
              };
            }),
          };
        });
        return {
          location: name,
          days,
        };
      });
    } else {
      return new Error(`No data found for key: ${key}`);
    }
  });
});

/**
 * DataLoader for loading base character information.
 *
 * This loader batches and caches requests to load character data by their keys.
 * It uses the `loadCharacters` function to fetch all characters and then maps
 * the requested keys to the corresponding character data.
 *
 * @param {Array<string>} keys - An array of character keys to load.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of character objects.
 */
export const baseCharacterLoader = new DataLoader(async (keys) => {
  const characters = await loadCharacters();
  return keys.map((key) => {
    return characters.map((char) => {
      const { name, iconUrl, element, rarity, weaponType, nation } = char;
      return {
        name,
        iconUrl,
        element: element.name,
        elementUrl: element.iconUrl,
        rarity: `${rarity} stars`,
        weaponType: weaponType.name,
        weaponUrl: weaponType.iconUrl,
        region: nation.name,
        regionUrl: nation.iconUrl,
      };
    });
  });
});
