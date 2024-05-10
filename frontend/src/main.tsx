import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { RecoilRoot } from "recoil";
import RecoilNexus from "recoil-nexus";

console.log(import.meta.env.VITE_GRAPHQL_URL);
const client = new ApolloClient({
  uri: import.meta.env.VITE_GRAPHQL_URL,
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
