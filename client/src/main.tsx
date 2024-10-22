import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import client from "./graphql/client";
import { ApolloProvider } from "@apollo/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./components/ui/theme-provider.tsx";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </ApolloProvider>
  </StrictMode>
);
