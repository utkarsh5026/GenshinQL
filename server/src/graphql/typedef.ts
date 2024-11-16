const typeDefs = `#graphql
type Weapon {
    name: String!,
    rarity: Int!,
    attack: Int!,
    subStat: String!,
    effect: String!
}

type FigureUrl {
    url: String!,
    caption: String,
}

type StringArrayRecord {
    key: String!
    value: [String!]!
}

type Talent {
    talentIcon: String!,
    talentName: String!,
    talentType: String!,
    description: String!,
    figureUrls: [FigureUrl!],
    scaling : [StringArrayRecord!],
}

type Constellation {
    name: String!,
    level: Int!,
    description: String!,
    iconUrl: String!,
}

type ImageUrls {
    card: String!,
    wish: String!,
    inGame: String!,
    nameCard: String!,
}

interface BaseCharacter {
    name: String!,
    element: String!,
    rarity: String!,
    weaponType: String!,
    region: String!,
    iconUrl: String!,
    elementUrl: String!,
    weaponUrl: String!,
    regionUrl: String!,
}


type Character implements BaseCharacter {
    name: String!,
    element: String!,
    rarity: String!,
    weaponType: String!,
    region: String!,
    iconUrl: String!,
    elementUrl: String!,
    weaponUrl: String!,
    regionUrl: String!,
    idleOne: AnimationMedia,
    idleTwo: AnimationMedia,
    partyJoin: AnimationMedia,
}

type AdvancedCharacter implements BaseCharacter {
    name: String!,
    element: String!,
    rarity: String!,
    weaponType: String!,
    region: String!,
    iconUrl: String!,
    elementUrl: String!,
    weaponUrl: String!,
    regionUrl: String!,
    talents: [Talent!],
    constellations: [Constellation!],
    imageUrls: ImageUrls!,
    screenAnimation: ScreenAnimation!,
}


input CharacterFilter {
    name: String,
    element: String,
    rarity: String,
    weaponType: String,
    region: String,
}

type TalentCharacter {
    name: String!,
    url: String!,
}

type TalentBook {
    name: String!,
    url: String!,
}


type TalentMaterialDay {
    day: String!,
    books: [TalentBook!]!,
    characters: [TalentCharacter!]!,
}

type TalentMaterial {
    location: String!,
    days: [TalentMaterialDay!]!,
}



type Weapon {
    name: String!,
    rarity: Int!,
    attack: Int!,
    iconUrl: String!,
    subStat: String!,
    effect: String!,
    type: String!,
    passives: [String!]!,
}

type WeaponTypeDetails {
    type: String!,
    weapons: [Weapon!]!,
}

type AnimationMedia {
    imageUrl: String
    videoUrl: String
    caption: String
    videoType: String
}

type AttackAnimation {
    normalAttack: AnimationMedia
    elementalSkill: AnimationMedia
    elementalBurst: AnimationMedia
}

type ScreenAnimation {
    idleOne: AnimationMedia
    idleTwo: AnimationMedia
    partySetup: AnimationMedia
}

type NameCardImage {
    background: String
    icon: String
}

type CharacterGallery {
    attackAnimation: AttackAnimation
    screenAnimation: ScreenAnimation
    nameCard: NameCardImage
}

type CharacterAttackAnimations {
    normalAttack: [AnimationMedia!]
    elementalSkill: [AnimationMedia!]
    elementalBurst: [AnimationMedia!]
}


type WeaponImage {
    name: String!
    iconUrl: String!
}

type WeaponMaterial {
    day: String!
    weapons: [WeaponImage!]!
    materialImages: [WeaponImage!]!
}

type WeaponMaterialSchedule {
    nation: String!
    materials: [WeaponMaterial!]!
}

type Query {
    characters: [Character!]
    character(name: String!): AdvancedCharacter!
    characterGallery(name: String!): CharacterGallery!
    filterCharacters(filter: CharacterFilter!): [Character!]
    talentBooks: [TalentMaterial!]
    weapons: [WeaponTypeDetails!]
    characterAttackAnimations(name: String!): CharacterAttackAnimations!
    weaponMaterialSchedule: [WeaponMaterialSchedule!]!
}
`;

export default typeDefs;
