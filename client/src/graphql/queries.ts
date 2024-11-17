import { gql } from "@apollo/client";

const ANIMATION_FIELDS = gql`
  fragment AnimationFields on AnimationMedia {
    imageUrl
    videoUrl
    caption
    videoType
  }
`;

export const GET_CHARACTERS = gql`
  ${ANIMATION_FIELDS}
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
      idleOne {
        ...AnimationFields
      }
      idleTwo {
        ...AnimationFields
      }
      partyJoin {
        ...AnimationFields
      }
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
      screenAnimation {
        idleOne {
          ...AnimationFields
        }
        idleTwo {
          ...AnimationFields
        }
        partySetup {
          ...AnimationFields
        }
      }
    }
  }
  ${ANIMATION_FIELDS}
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

export const WEAPON_FIELDS = gql`
  fragment WeaponFields on Weapon {
    type
    rarity
    name
    attack
    subStat
    effect
    iconUrl
  }
`;

export const GET_WEAPONS = gql`
  query Weapons {
    weapons {
      type
      weapons {
        ...WeaponFields
      }
    }
  }
  ${WEAPON_FIELDS}
`;

export const GET_CHARACTER_ATTACK_ANIMATIONS = gql`
  query Characters($name: String!) {
    characterAttackAnimations(name: $name) {
      normalAttack {
        ...AnimationFields
      }
      elementalSkill {
        ...AnimationFields
      }
      elementalBurst {
        ...AnimationFields
      }
    }
  }
  ${ANIMATION_FIELDS}
`;

export const GET_WEAPON_MATERIALS_CALENDAR = gql`
  query Schedule {
    weaponMaterialSchedule {
      nation
      materials {
        day
        materialImages {
          caption
          url
        }
        weapons {
          name
          iconUrl
          rarity
          attack
          subStat
          effect
          type
        }
      }
    }
  }
`;

export const GET_WEAPONS_OF_TYPE = gql`
  query WeaponsOfType($type: String!) {
    weaponsOfType(type: $type) {
      ...WeaponFields
    }
  }
  ${WEAPON_FIELDS}
`;
