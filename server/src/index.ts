import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import typeDefs from "./graphql/typedef";
import resolvers from "./graphql/resolvers";
import { initDb } from "./db/init";
import { loadTalentBooksSchedule } from "./db/load";
import { talentBooksLoader } from "./graphql/loader";

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
});

async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async () => ({
      loaders: {
        talentBooksLoader,
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

    const talents = await loadTalentBooksSchedule();
  })
  .catch((error) => {
    console.error(error);
  });
