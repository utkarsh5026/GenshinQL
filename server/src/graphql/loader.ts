import DataLoader from "dataloader";
import { loadTalentBooksSchedule } from "../db/load";

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

// Function to load talent books using DataLoader
export async function loadTalentBooks() {
  const key = "all"; // or any appropriate key
  return talentBooksLoader.load(key);
}
