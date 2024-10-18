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


type Character {
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
}
`;

export default typeDefs;
