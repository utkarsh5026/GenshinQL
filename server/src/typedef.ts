const typeDefs = `#graphql
type Weapon {
    name: String!,
    rarity: Int!,
    attack: Int!,
    subStat: String!,
    effect: String!
}

type Talent {
    name: String!,
    type: String!,
    description: String!,
}

type Constellation {
    name: String!,
    level: Int!,
    description: String!,
}

interface BaseCharacter {
    name: String!,
    element: String!,
    rarity: String!,
    weaponType: String!,
    region: String!,
}


type Character implements BaseCharacter {
    name: String!,
    element: String!,
    rarity: String!,
    weaponType: String!,
    region: String!,
}

type AdvancedCharacter implements BaseCharacter {
    name: String!,
    element: String!,
    rarity: String!,
    weaponType: String!,
    region: String!,
    talents: [Talent!],
    constellations: [Constellation!],
}



type Query {
    characters: [Character!]
    character(name: String!): AdvancedCharacter!
}
`;

export default typeDefs;