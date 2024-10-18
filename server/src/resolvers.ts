import { IResolvers } from "@graphql-tools/utils";
import { characters, getCharacter } from "./data/load";

const resolvers: IResolvers = {
  Query: {
    characters: () => characters,
    character: (_, { name }: { name: string }) => getCharacter(name),
  },
};

export default resolvers;
