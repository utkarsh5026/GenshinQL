export const underScore = (str: string) => str.split(" ").join("_");

export const parseCharacterName = (name: string) => name.split(" ").join("_");

export const parseUrl = (url: string) => url.split("/revision/")[0];