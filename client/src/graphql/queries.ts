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
      weaponUrl
      regionUrl
      idleOneUrl
      idleTwoUrl
      partyJoinUrl
    }
  }
`;

export const GET_CHARACTER_FOR_SIDEBAR = gql`
  query GetCharacterForSidebar {
    characters {
      name
      iconUrl
    }
  }
`;

export const GET_CHARACTER = gql`
  query Characters($name: String!) {
    character(name: $name) {
      constellations {
        description
        iconUrl
        level
        name
      }
      weaponUrl
      weaponType
      talents {
        talentType
        talentName
        talentIcon
        description
        figureUrls {
          url
          caption
        }
        scaling {
          key
          value
        }
      }
      regionUrl
      region
      rarity
      name
      imageUrls {
        nameCard
      }
      iconUrl
      elementUrl
      element
    }
  }
`;

export const GET_TALENT_MATERIALS_CALENDAR = gql`
  query TalentBooks {
    talentBooks {
      location
      days {
        day
        books {
          name
          url
        }
        characters {
          url
          name
        }
      }
    }
  }
`;

export const GET_WEAPONS = gql`
  query Weapons {
    weapons {
      type
      weapons {
        type
        rarity
        name
        attack
        subStat
      }
    }
  }
`;
