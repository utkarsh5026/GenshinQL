import { IResolvers } from "@graphql-tools/utils";
import {
  characters,
  filterCharacters,
  getCharacter,
  loadDailyTalents,
  loadGallery,
} from "./data/load";

const resolvers: IResolvers = {
  Query: {
    characters: () => characters,
    character: (_, { name }: { name: string }) => {
      const character = getCharacter(name);
      if (!character) {
        throw new Error(`Character "${name}" not found`);
      }

      const newCharacter: any = {
        ...character,
      };

      for (let i = 0; i < character.talents.length; i++) {
        const talent = character.talents[i];
        newCharacter.talents[i].scaling = Object.entries(talent.scaling).map(
          ([key, value]) => {
            return {
              key,
              value,
            };
          }
        );
      }

      return newCharacter;
    },
    filterCharacters: (_, args) => filterCharacters(args.filter),
    // talentBooks: () => {
    //   const talentBooks = loadDailyTalents();
    //   const gallery = loadGallery();
    //   console.dir(talentBooks, { depth: 2 });
    //   return Object.entries(talentBooks).map(([location, days]) => {
    //     for (const day of days) {
    //       day.characters = day.characters.map((character) => {
    //         const name = character.name.split(" ").join("_");
    //         const characterData = Object.keys(gallery).find((key) =>
    //           key.includes(name)
    //         );

    //         console.log(characterData, character.name);
    //         return {
    //           name: character.name,
    //           url:
    //             characterData && gallery[characterData][0].url !== ""
    //               ? gallery[characterData][0].url
    //               : character.url,
    //         };
    //       });
    //     }
    //     return {
    //       location,
    //       days,
    //     };
    //   });
    // },
  },
};

export default resolvers;
