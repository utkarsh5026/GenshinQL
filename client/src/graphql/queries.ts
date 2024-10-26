import { gql } from "@apollo/client";

export const GET_CHARACTERS = gql`
  query GetCharacters {
    characters {
      name
      iconUrl
      rarity
      element
      weaponType
      region
      elementUrl
    }
  }
`;
