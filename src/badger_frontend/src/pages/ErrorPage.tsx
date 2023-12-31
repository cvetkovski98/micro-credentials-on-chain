import React from "react";
import { Link } from "react-router-dom";

interface ErrorPageProps {
  code: number;
  message: string;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ code, message }) => {
  return (
    <div className="grid h-screen px-4 bg-white place-content-center">
      <div className="text-center">
        <h1 className="font-black text-gray-200 text-9xl">{code}</h1>
        <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">Uh-oh!</p>
        <p className="mt-4 text-gray-500">{message}</p>
        <Link
          to="/"
          className="inline-block px-5 py-3 mt-6 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-900 focus:outline-none focus:ring"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};
