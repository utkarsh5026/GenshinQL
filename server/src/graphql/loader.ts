import DataLoader from "dataloader";
import {
  loadTalentBooksSchedule,
  loadCharacters,
  loadWeapons,
  loadCharacterByName,
} from "../db/load";
import { randomInt } from "crypto";
import Character from "../db/models/Character";

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

              const prob = randomInt(0, 100);
              if (prob < 50) {
                if (gallery?.screenAnimation?.idleOne)
                  iconUrl = gallery.screenAnimation.idleOne;
              } else {
                if (gallery?.screenAnimation?.idleTwo)
                  iconUrl = gallery.screenAnimation.idleTwo;
              }

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
      return {
        ...toGraphQlCharacter(char),
        idleOneUrl: char.gallery?.screenAnimation?.idleOne,
        idleTwoUrl: char.gallery?.screenAnimation?.idleTwo,
      };
    });
  });
});

/**
 * DataLoader for loading weapon information.
 *
 * This loader batches and caches requests to load weapon data by their keys.
 * It uses the `loadWeapons` function to fetch all weapons and then maps
 * the requested keys to the corresponding weapon data.
 *
 * @param {Array<string>} keys - An array of weapon keys to load.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of weapon objects.
 */
export const weaponLoader = new DataLoader(async (keys) => {
  const weapons = await loadWeapons();
  return keys.map((key) => {
    return weapons.map((weaponType) => {
      const { weapons, name } = weaponType;
      return {
        type: name,
        weapons: weapons.map((weapon) => {
          const { name, rarity, attack, subStat, effect, materials } = weapon;
          return {
            name,
            rarity,
            attack,
            subStat,
            effect,
            type: weaponType.name,
            materials: materials.map((mat) => ({
              url: mat.url,
              name: mat.caption,
              amount: mat.count,
            })),
            passives: weapon.passives.map((passive) => passive.description),
          };
        }),
      };
    });
  });
});

/**
 * DataLoader for loading character information.
 *
 * This loader batches and caches requests to load character data by their keys.
 * It uses the `loadCharacterByName` function to fetch character details and then
 * maps the requested keys to the corresponding character data.
 *
 * @param {Array<string>} keys - An array of character keys to load.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of character objects.
 */
export const characterLoader = new DataLoader(
  async (keys: readonly string[]) => {
    return keys.map(async (key) => {
      const character = await loadCharacterByName(key);
      if (character) {
        const { constellations, characterTalents } = character;
        return {
          ...toGraphQlCharacter(character),
          constellations: constellations.map((con) => {
            const { description, name, iconUrl, level } = con;
            return {
              name,
              description,
              iconUrl,
              level,
            };
          }),
          talents: characterTalents.map((talent) => {
            const {
              name,
              iconUrl,
              talentType,
              description,
              scaling,
              talentAnimations,
            } = talent;
            return {
              talentName: name,
              talentIcon: iconUrl,
              talentType,
              description,
              scaling: Object.entries(scaling).map(([key, value]) => ({
                key,
                value,
              })),
              figureUrls: talentAnimations.map((anim) => {
                const { url, caption } = anim;
                return {
                  url,
                  caption,
                };
              }),
            };
          }),
          imageUrls: {
            nameCard: character.gallery.nameCard.background,
          },
        };
      }
    });
  }
);

/**
 * Converts a Character object to a GraphQL-compatible format.
 *
 * This function takes a Character object and extracts relevant fields,
 * transforming them into a format suitable for GraphQL responses.
 *
 * @param {Character} character - The character object to convert.
 * @returns {Object} A GraphQL-compatible character object.
 */
function toGraphQlCharacter(character: Character) {
  const { name, iconUrl, element, rarity, weaponType, nation } = character;
  return {
    name,
    iconUrl,
    element: element.name,
    elementUrl: element.iconUrl,
    rarity,
    weaponType: weaponType.name,
    weaponUrl: weaponType.iconUrl,
    region: nation.name,
    regionUrl: nation.iconUrl,
  };
}
