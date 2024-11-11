import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import typeDefs from "./graphql/typedef";
import resolvers from "./graphql/resolvers";
import { initDb } from "./db/init";
import {
  baseCharacterLoader,
  talentBooksLoader,
  weaponLoader,
  characterLoader,
} from "./graphql/loader";

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

    // console.dir(await loadWeapons(), { depth: null });
  })
  .catch((error) => {
    console.error(error);
  });
