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
} from "./graphql/loader";
import { loadWeaponMaterialSchedule } from "./db/load";

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  plugins: [ApolloServerPluginLandingPageLocalDefault()],
});

async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async () => ({
      loaders: {
        talentBooksLoader,
        baseCharacterLoader,
        weaponLoader,
        characterLoader,
        characterGalleryLoader,
        characterAttackAnimationsLoader,
        weaponMaterialScheduleLoader,
      },
    }),
  });
  console.log(`🚀  Server ready at: ${url}`);
}

startServer()
  .then(async () => {
    console.log("Server started");
    await initDb();
    console.log("Database initialized");
  })
  .catch((error) => {
    console.error(error);
  });
