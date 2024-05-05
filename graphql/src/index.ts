import { ApolloServer } from "@apollo/server";
import { createServer } from "http";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import express from "express";
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs, resolvers } from "./resolvers";

export interface GlobalContext {
  // You can optionally create a TS interface to set up types
  // for your contextValue
  authScope?: String;
}
// Create the schema, which will be used separately by ApolloServer and
// the WebSocket server.
const schema = makeExecutableSchema({ typeDefs, resolvers });

console.log("yeet pretty cool right");

// Create an Express app and HTTP server; we will attach both the WebSocket
// server and the ApolloServer to this HTTP server.
const app = express();
const httpServer = createServer(app);

// Create our WebSocket server using the HTTP server we just set up.
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/",
});
// Save the returned server's info so we can shutdown this server later
const serverCleanup = useServer({ schema }, wsServer);

// Set up ApolloServer.
const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();
app.use(
  "/",
  cors<cors.CorsRequest>(),
  express.json(),
  expressMiddleware(server)
);

const PORT = 4000;
// Now that our HTTP server is fully set up, we can listen to it.
// Now that our HTTP server is fully set up, actually listen.
httpServer.listen(PORT, () => {
  console.log(`\n🔨 Query endpoint ready at http://localhost:${PORT}/`);
  console.log(`🔨 Subscription endpoint ready at ws://localhost:${PORT}/`);
});
