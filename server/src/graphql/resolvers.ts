import { IResolvers } from "@graphql-tools/utils";
import { filterCharacters } from "../data/load";

const resolvers: IResolvers = {
  Query: {
    characters: async (_parent, _args, context) => {
      return await context.loaders.baseCharacterLoader.load("all");
    },
    character: async (_parent, { name }: { name: string }, context) => {
      try {
        const character = await context.loaders.characterLoader.load(name);
        return character;
      } catch (error) {
        console.error("Error fetching character:", error);
        throw new Error("Failed to fetch character");
      }
    },
    filterCharacters: (_, args) => filterCharacters(args.filter),
    talentBooks: async (_parent, _args, context) => {
      try {
        const talentBooks = await context.loaders.talentBooksLoader.load("all");
        return talentBooks;
      } catch (error) {
        console.error("Error fetching talent books:", error);
        throw new Error("Failed to fetch talent books");
      }
    },
    weapons: async (_parent, _args, context) => {
      return await context.loaders.weaponLoader.load("all");
    },
    characterGallery: async (_parent, { name }: { name: string }, context) => {
      return await context.loaders.characterGalleryLoader.load(name);
    },
    characterAttackAnimations: async (
      _parent,
      { name }: { name: string },
      context
    ) => {
      return await context.loaders.characterAttackAnimationsLoader.load(name);
    },
    weaponMaterialSchedule: async (_parent, _args, context) => {
      const schedule = await context.loaders.weaponMaterialScheduleLoader.load(
        "all"
      );

      console.dir(schedule, { depth: null });
      return schedule.filter(Boolean);
    },
  },
};

export default resolvers;
