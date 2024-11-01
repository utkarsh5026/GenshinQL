import {gql} from "@apollo/client";

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
                wish
                nameCard
                inGame
                card
            }
            iconUrl
            elementUrl
            element
        }
    }
`;