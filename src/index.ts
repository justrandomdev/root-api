import express from "express";
import { ApolloServer } from "apollo-server-express";
import schema from "./graphql/schemasMap";
import { RedisClient } from "./data/kv-store";

const port = process.env.PORT || 4000;
const hostname = process.env.SERVERHOST || "0.0.0.0";
const graphEndpoint = process.env.ENDPOINT || "/graphql";


const redisContext = async () => {
  const namespace = "graphql_api_";
  const expiryEnvVar = process.env.REDIS_EXPIRY
    ? parseInt(process.env.REDIS_EXPIRY)
    : undefined;
  const expiry = (expiryEnvVar || 30) * 60;
  const redisClient = new RedisClient(namespace, expiry, console);
  await redisClient.set("username:admin@example.com", "admin");

  return { redisClient };
};

async function startApollo() {
  const app = express();

  const server = new ApolloServer({
    schema,
    context: redisContext,
  });

  await server.start();
  server.applyMiddleware({ app, path: graphEndpoint });
  app.listen(port, () => {

    console.log(
      `\n\t GraphQL is running on http://${hostname}:${port}${graphEndpoint}`
    );

  });
}



startApollo();
