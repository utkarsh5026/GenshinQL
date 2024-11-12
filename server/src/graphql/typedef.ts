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


type WeaponMaterial {
    url: String!,
    name: String!,
    amount: Int!,
}

type Weapon {
    name: String!,
    rarity: Int!,
    attack: Int!,
    subStat: String!,
    effect: String!,
    type: String!,
    passives: [String!]!,
    materials: [WeaponMaterial!]!,
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
    partyJoin: AnimationMedia
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


type Query {
    characters: [Character!]
    character(name: String!): AdvancedCharacter!
    characterGallery(name: String!): CharacterGallery!
    filterCharacters(filter: CharacterFilter!): [Character!]
    talentBooks: [TalentMaterial!]
    weapons: [WeaponTypeDetails!]
}
`;

export default typeDefs;
