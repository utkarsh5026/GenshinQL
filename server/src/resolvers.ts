import { characters } from "./data/load";

const resolvers = {
  Query: {
    characters: () => characters,
  },
};

export default resolvers;
