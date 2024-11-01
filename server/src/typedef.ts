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


type Query {
    characters: [Character!]
    character(name: String!): AdvancedCharacter!
    filterCharacters(filter: CharacterFilter!): [Character!]
}
`;

export default typeDefs;