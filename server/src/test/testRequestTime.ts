import pako from "pako";
import { loadJsonPath } from "../data/setup";
import path from "path";
import { z } from "zod";
import { baseCharacterSchema } from "../data/schema";

type BaseCharacter = z.infer<typeof baseCharacterSchema>;

const QUERY = `#graphql
  query GetCharacter($name: String!) {
    character(name: $name) {
      name
      element
      elementUrl
      rarity
      weaponType
      region
      iconUrl
      weaponUrl
      regionUrl

      constellations {
        name
        level
        description
        iconUrl
      }
      talents {
        talentIcon
        talentName
        talentType
        description
        figureUrls {
          url
          caption
        }
      }
    }
  }
`;

async function test() {
  const characters = (await loadJsonPath(
    path.join("characters", "characters.json")
  )) as BaseCharacter[];

  const now = performance.now();
  for (const character of characters.slice(0, 1)) {
    try {
      const result = await fetch("http://127.0.0.1:4000/graphql", {
        method: "POST",
        headers: {
          "x-apollo-operation-name": "GetCharacter",
          "Content-Type": "application/json",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
        },
        body: JSON.stringify({
          query: QUERY,
          variables: { name: character.name },
        }),
      });

      const contentEncoding = result.headers.get("content-encoding");
      console.log("Content-Encoding:", contentEncoding);
      console.log("Response headers:", Object.fromEntries(result.headers));

      if (contentEncoding === "gzip") {
        try {
          const buffer = await result.arrayBuffer();
          console.log("Received buffer length:", buffer.byteLength);
          const compressed = new Uint8Array(buffer);
          const decompressed = pako.inflate(compressed, { to: "string" });
          const jsonData = JSON.parse(decompressed);
          console.log("Decompressed data:", jsonData);
        } catch (error) {
          console.error("Error decompressing:", error);
          // Fallback to regular JSON parsing
          console.log("Falling back to regular JSON parsing");
          console.log("Raw data:", await result.text());
        }
      } else {
        console.log("Uncompressed data:", await result.json());
      }
    } catch (error) {
      console.error("Error processing character:", character.name, error);
    }
  }
  const end = performance.now();
  console.log(`Time taken: ${end - now}ms`);
}

if (require.main === module) {
  test().then(() => {
    console.log("Done");
  });
}
