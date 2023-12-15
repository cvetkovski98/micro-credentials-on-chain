import React, { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useBackendActor } from "../context/ActorContext";
import { useClient } from "../context/AuthContext";
import { XIcon } from "./icons/XIcon";

const routes = [
  {
    label: "Badges",
    path: "/badges",
  },
];

export interface ItemProps extends React.PropsWithChildren {
  to: string;
  mobile?: boolean;
}

export const Item: React.FC<ItemProps> = ({ to, mobile, children }) => {
  return (
    <NavLink
      to={to}
      end={true}
      className={({ isActive }) => {
        return `text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium
        ${isActive ? "bg-gray-900 text-white" : ""} ${mobile ? "block" : ""}`;
      }}
    >
      {children}
    </NavLink>
  );
};

interface NavBarProps {
  isOpen: boolean;
  toggle: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({ isOpen, toggle }) => {
  const client = useClient();
  const actor = useBackendActor();
  const [i, setI] = React.useState("");

  useEffect(() => {
    actor.whoami().then((i) => {
      console.log(`Received ${i} from actor.whoami()`);
      setI(i);
    });
  });

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={toggle}
            >
              <span className="absolute -inset-0.5"></span>
              <span className="sr-only">Open main menu</span>
              {!isOpen ? <XIcon /> : <XIcon />}
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-between">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                className="block h-8 w-auto"
                src={"/logo.svg"}
                alt="Workflow"
              />
              <span className="ml-4 text-white font-bold">
                ZHAW Micro-Credentials On Chain {i}
              </span>
            </Link>
            <div className="hidden ml-auto sm:ml-6 sm:flex">
              <div className="flex space-x-4">
                {routes.map((route) => (
                  <Item key={route.path} to={route.path}>
                    {route.label}
                  </Item>
                ))}
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={() => {
                  client.logout({
                    returnTo: window.location.origin,
                  });
                }}
                className="ml-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*  Mobile menu, show/hide based on menu state.  */}
      <div
        className={`sm:hidden ${isOpen ? "block" : "hidden"}`}
        id="mobile-menu"
      >
        <div className="space-y-1 px-2 pb-3 pt-2">
          {/* Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" */}
          {routes.map((route) => (
            <Item key={route.path} mobile to={route.path}>
              {route.label}
            </Item>
          ))}
        </div>
      </div>
    </nav>
  );
};
