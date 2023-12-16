import React from "react";
import { Navigate, createHashRouter } from "react-router-dom";
import { ProtectedPage } from "../components/ProtectedPage";
import { ErrorPage } from "./ErrorPage";
import { LandingPage } from "./LandingPage";
import { Layout } from "./Layout";
import { BadgeCreatePage } from "./badges/Create";
import { BadgeDetailsPage } from "./badges/Details";
import { BadgeListPage } from "./badges/List";
import { UserRegisterPage } from "./users/Register";

export const PageRouter = createHashRouter([
  {
    path: "/forbidden",
    element: <ErrorPage code={403} message="You are not allowed to access this page." />,
  },
  {
    path: "/error",
    element: <ErrorPage code={404} message="Something went wrong." />,
  },
  {
    path: "/",
    element: (
      <ProtectedPage>
        <Layout />
      </ProtectedPage>
    ),
    errorElement: <Navigate to="/error" />,
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
      {
        path: "users/register",
        element: (
          <ProtectedPage>
            <UserRegisterPage />
          </ProtectedPage>
        ),
      },
    ],
  },
]);
