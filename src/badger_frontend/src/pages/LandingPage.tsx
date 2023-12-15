import React from "react";
import { Link } from "react-router-dom";
import { useClient } from "../context/AuthContext";

export const LandingPage: React.FC = () => {
  const client = useClient();

  return (
    <div className="grid px-4 bg-white place-content-center">
      <div className="text-center">
        <h1 className="font-black text-gray-200 text-9xl mt-24">Welcome</h1>
        <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          ZHAW Micro-Credentials
        </p>
        <p className="mt-4 text-gray-500">Take a look at your credentials</p>
        <Link
          to="/badges"
          className="inline-block px-5 py-3 mt-6 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-900 focus:outline-none focus:ring"
        >
          Go to Credentials
        </Link>
      </div>
    </div>
  );
};
