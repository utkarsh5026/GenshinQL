import { IResolvers } from "@graphql-tools/utils";
import { characters, getCharacter, filterCharacters } from "./data/load";

const resolvers: IResolvers = {
  Query: {
    characters: () => characters,
    character: (_, { name }: { name: string }) => getCharacter(name),
    filterCharacters: (_, args) => filterCharacters(args.filter),
  },
};

export default resolvers;
