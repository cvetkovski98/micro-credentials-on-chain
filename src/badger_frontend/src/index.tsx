import React from "react";
import { RouterProvider } from "react-router-dom";
import { PageRouter } from "./pages/Router";

import "./index.css";
import { createRoot } from "react-dom/client";
import { GlobalContextProvider } from "./context/Global";

const domNode = document.getElementById("app");
if (!domNode) {
  throw new Error("Could not find DOM node with ID 'app'");
}

const root = createRoot(domNode);
root.render(
  <React.StrictMode>
    <GlobalContextProvider>
      <RouterProvider router={PageRouter} />
    </GlobalContextProvider>
  </React.StrictMode>,
);
