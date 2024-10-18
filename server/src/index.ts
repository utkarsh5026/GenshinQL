import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import typeDefs from "./typedef";

const server = new ApolloServer({
  typeDefs: typeDefs,
});

async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`🚀  Server ready at: ${url}`);
}

startServer()
  .then(() => {
    console.log("Server started");
  })
  .catch((error) => {
    console.error(error);
  });
