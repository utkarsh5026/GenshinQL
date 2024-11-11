import { IResolvers } from "@graphql-tools/utils";
import { filterCharacters } from "../data/load";

const resolvers: IResolvers = {
  Query: {
    characters: async (_parent, _args, context) => {
      return await context.loaders.baseCharacterLoader.load("all");
    },
    character: async (_parent, { name }: { name: string }, context) => {
      return await context.loaders.characterLoader.load(name);
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
