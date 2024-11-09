import { IResolvers } from "@graphql-tools/utils";
import { filterCharacters } from "../data/load";

const resolvers: IResolvers = {
  Query: {
    characters: async (_parent, _args, context) => {
      return await context.loaders.baseCharacterLoader.load("all");
    },
    character: async (_parent, { name }: { name: string }, context) => {
      const character = await context.loaders.baseCharacterLoader.load(name);
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
    talentBooks: async (_parent, _args, context) => {
      try {
        const talentBooks = await context.loaders.talentBooksLoader.load("all");
        console.dir(talentBooks, { depth: null });
        return talentBooks;
      } catch (error) {
        console.error("Error fetching talent books:", error);
        throw new Error("Failed to fetch talent books");
      }
    },
    weapons: async (_parent, _args, context) => {
      return await context.loaders.weaponLoader.load("all");
    },
  },
};

export default resolvers;
