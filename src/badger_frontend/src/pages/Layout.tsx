import React from "react";
import { Outlet } from "react-router-dom";
import { NavBar } from "../components/NavigationBar";

export const Layout: React.FC = () => {
  const [navOpen, setNavOpen] = React.useState(false);

  return (
    <React.Fragment>
      <NavBar isOpen={navOpen} toggle={() => setNavOpen((state) => !state)} />
      <div className="container mx-auto max-w-7xl px-2 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </React.Fragment>
  );
};
