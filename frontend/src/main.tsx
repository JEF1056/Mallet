import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  split,
} from "@apollo/client";
import { RecoilRoot } from "recoil";
import RecoilNexus from "recoil-nexus";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

const wsLink = new GraphQLWsLink(
  createClient({
    url: `${import.meta.env.VITE_SECURE_URLS === "true" ? "wss" : "ws"}://${
      import.meta.env.VITE_GRAPHQL_URL
    }`,
  })
);

const httpLink = new HttpLink({
  uri: `${import.meta.env.VITE_SECURE_URLS === "true" ? "https" : "http"}://${
    import.meta.env.VITE_GRAPHQL_URL
  }`,
});

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={client}>
    <RecoilRoot>
      <RecoilNexus />
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </RecoilRoot>
  </ApolloProvider>
);
