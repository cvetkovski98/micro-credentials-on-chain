import React from "react";
import { createHashRouter } from "react-router-dom";
import { Layout } from "./Layout";
import { BadgeListPage } from "./badges/List";
import { BadgeCreatePage } from "./badges/Create";
import { BadgeDetailsPage } from "./badges/Details";
import { ErrorPage } from "./ErrorPage";
import { LandingPage } from "./LandingPage";
import { ProtectedPage } from "../components/ProtectedPage";

export const PageRouter = createHashRouter([
  {
    path: "/",
    element: (
      <ProtectedPage>
        <Layout />
      </ProtectedPage>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        path: "badges",
        element: (
          <ProtectedPage>
            <BadgeListPage />
          </ProtectedPage>
        ),
      },
      {
        path: "badges/create",
        element: (
          <ProtectedPage>
            <BadgeCreatePage />
          </ProtectedPage>
        ),
      },
      {
        path: "badges/:id",
        element: (
          <ProtectedPage>
            <BadgeDetailsPage />
          </ProtectedPage>
        ),
      },
    ],
  },
]);
