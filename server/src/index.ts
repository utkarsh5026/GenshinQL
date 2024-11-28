import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import typeDefs from "./graphql/typedef";
import resolvers from "./graphql/resolvers";
import { initDb } from "./db/init";
import {
  baseCharacterLoader,
  characterAttackAnimationsLoader,
  characterGalleryLoader,
  characterLoader,
  talentBooksLoader,
  weaponLoader,
  weaponMaterialScheduleLoader,
  weaponsOfTypeLoader,
} from "./graphql/loader";

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  plugins: [ApolloServerPluginLandingPageLocalDefault()],
});

async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4001 },
    context: async () => ({
      loaders: {
        talentBooksLoader,
        baseCharacterLoader,
        weaponLoader,
        characterLoader,
        characterGalleryLoader,
        characterAttackAnimationsLoader,
        weaponMaterialScheduleLoader,
        weaponsOfTypeLoader,
      },
    }),
  });
  console.log(`🚀  Server ready at: ${url}`);
}

startServer()
  .then(async () => {
    console.log("Server started");
    await initDb();
  })
  .catch((error) => {
    console.error(error);
  });
