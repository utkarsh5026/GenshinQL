import {IResolvers} from "@graphql-tools/utils";
import {characters, filterCharacters, getCharacter} from "./data/load";

const resolvers: IResolvers = {
  Query: {
    characters: () => characters,
    character: (_, { name }: { name: string }) => {
      const character = getCharacter(name);
      if (!character) {
        throw new Error(`Character "${name}" not found`);
      }

      const newCharacter: any = {
        ...character
      }

      for (let i = 0; i < character.talents.length; i++) {
        const talent = character.talents[i];
        newCharacter.talents[i].scaling = Object.entries(talent.scaling).map(([key, value]) => {
          return {
            key,
            value
          }
        });
      }

      console.dir(newCharacter)
      return newCharacter;
    },
    filterCharacters: (_, args) => filterCharacters(args.filter),
  },
};


export default resolvers;