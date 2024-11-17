import DataLoader from "dataloader";
import {
  loadCharacterAttackAnimations,
  loadCharacterByName,
  loadCharacterGallery,
  loadCharacters,
  loadTalentBooksSchedule,
  loadWeaponMaterialSchedule,
  loadWeapons,
  loadWeaponsOfType,
} from "../db/load";
import { randomInt } from "crypto";
import Character from "../db/models/Character";
import { animationSchema } from "../data/schema";
import { z } from "zod";

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
                  iconUrl = gallery.screenAnimation.idleOne.imageUrl;
              } else if (gallery?.screenAnimation?.idleTwo)
                iconUrl = gallery.screenAnimation.idleTwo.imageUrl;

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
        idleOne: char.gallery?.screenAnimation?.idleOne,
        idleTwo: char.gallery?.screenAnimation?.idleTwo,
        partyJoin: char.gallery?.screenAnimation?.partySetup,
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
          const { name, rarity, attack, subStat, effect, iconUrl } = weapon;
          return {
            name,
            rarity,
            attack,
            subStat,
            effect,
            iconUrl,
            type: weaponType.name,
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
          screenAnimation: character.gallery.screenAnimation,
        };
      }
    });
  }
);

/**
 * DataLoader for loading character galleries.
 *
 * This DataLoader batches and caches requests to load character galleries
 * by their names. It retrieves the gallery information for each character,
 * including attack animations, screen animations, and name card details.
 *
 * @param {readonly string[]} keys - An array of character names to load galleries for.
 * @returns {Promise<Object[]>} A promise that resolves to an array of character gallery objects.
 */
export const characterGalleryLoader = new DataLoader(
  async (keys: readonly string[]) => {
    return keys.map(async (key) => {
      const charGallery = await loadCharacterGallery(key);
      if (charGallery) {
        const { gallery } = charGallery;
        const { attackAnimation, screenAnimation, nameCard } = gallery;
        return {
          attackAnimation: {
            normalAttack: attackAnimation.normalAttack,
            elementalSkill: attackAnimation.elementalSkill,
            elementalBurst: attackAnimation.elementalBurst,
          },
          screenAnimation: {
            idleOne: screenAnimation.idleOne,
            idleTwo: screenAnimation.idleTwo,
            partyJoin: screenAnimation.partySetup,
          },
          nameCard: {
            background: nameCard.background,
            icon: nameCard.icon,
          },
        };
      }
    });
  }
);

/**
 * DataLoader for loading character attack animations.
 *
 * This DataLoader batches and caches requests to load character attack animations
 * by their names. It retrieves the animation details for each character,
 * including normal attacks, elemental skills, and elemental bursts.
 *
 * @param {readonly string[]} keys - An array of character names to load attack animations for.
 * @returns {Promise<Object[]>} A promise that resolves to an array of character attack animation objects.
 */
export const characterAttackAnimationsLoader = new DataLoader(
  async (keys: readonly string[]) => {
    const toGraphQlForm = (animations: z.infer<typeof animationSchema>[]) => {
      return animations.map((ani) => {
        const { url, caption, videoType, videoUrl } = ani;
        return {
          imageUrl: url,
          caption,
          videoUrl,
          videoType,
        };
      });
    };

    return keys.map(async (key) => {
      const char = await loadCharacterAttackAnimations(key);
      console.dir(char, { depth: null });
      if (char) {
        const { gallery } = char;
        const { attackAnimation } = gallery;
        return {
          normalAttack: toGraphQlForm(attackAnimation.normalAttack),
          elementalSkill: toGraphQlForm(attackAnimation.elementalSkill),
          elementalBurst: toGraphQlForm(attackAnimation.elementalBurst),
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

/**
 * DataLoader for weapon material schedules.
 *
 * This loader retrieves the schedule of weapon material availability for each nation.
 * It filters out Snezhnaya and transforms the data into a GraphQL-compatible format.
 * The schedule includes:
 * - The nation name
 * - Material availability days
 * - Associated weapons and their types
 * - Material images
 *
 * @returns {Promise<Array>} An array of weapon material schedules grouped by nation
 */
export const weaponMaterialScheduleLoader = new DataLoader(
  async (keys: readonly string[]) => {
    const schedule = await loadWeaponMaterialSchedule();
    return keys.map((key) => {
      return schedule
        .map((nation) => {
          const { name, weaponMaterials } = nation;
          if (name === "Snezhnaya") return null;
          const materials = weaponMaterials.map((mat) => {
            const { dayOne, dayTwo, weapons, materialImages } = mat;
            return {
              day: `${dayOne} ${dayTwo}`,
              weapons: weapons.map((weapon) => ({
                ...weapon,
                type: weapon.weaponType.name,
              })),
              materialImages,
            };
          });

          return {
            nation: name,
            materials,
          };
        })
        .filter(Boolean);
    });
  }
);

/**
 * DataLoader for weapons of a specific type.
 *
 * This loader retrieves all weapons that match a given weapon type (e.g., "Sword", "Bow", etc.).
 * It batches and caches requests for weapons by their type to optimize database queries.
 *
 * @returns {Promise<Array>} An array of weapons matching the requested weapon type.
 */
export const weaponsOfTypeLoader = new DataLoader(
  async (keys: readonly string[]) => {
    return keys.map(async (key) => {
      const weapons = await loadWeaponsOfType(key);
      return weapons.map((weapon) => ({
        ...weapon,
        type: weapon.weaponType.name,
      }));
    });
  }
);
