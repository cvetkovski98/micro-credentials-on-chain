import React from "react";
import { RouterProvider } from "react-router-dom";
import { PageRouter } from "./pages/Router";
import ReactDOM from "react-dom";

import "./index.css";
import { createRoot } from "react-dom/client";
import { GlobalContextProvider } from "./context/ActorContext";
import { AuthProvider } from "./context/AuthContext";
// Refactor to use createRoot

const domNode = document.getElementById("app");
if (!domNode) {
  throw new Error("Could not find DOM node with ID 'app'");
}

const root = createRoot(domNode);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <GlobalContextProvider>
        <RouterProvider router={PageRouter} />
      </GlobalContextProvider>
    </AuthProvider>
  </React.StrictMode>
);
