import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useClient } from "../context/Global";

const CANISTER_ID_IDENTITY = process.env.CANISTER_ID_INTERNET_IDENTITY;

export const LandingPage: React.FC = () => {
  const client = useClient();
  const [loading, setLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  useEffect(() => {
    setLoading((_) => true);
    client
      .isAuthenticated()
      .then((isAuthenticated) => {
        setIsAuthenticated((_) => isAuthenticated);
      })
      .finally(() => {
        setLoading((_) => false);
      });
  }, [client, client.getIdentity()]);

  const login = () => {
    const provider =
      process.env.DFX_NETWORK === "ic"
        ? "https://identity.ic0.app"
        : `http://localhost:4943/?canisterId=${CANISTER_ID_IDENTITY}`;

    client.login({
      identityProvider: provider,
      onSuccess: () => {
        setLoading((_) => false);
        window.location.reload();
      },
      onError: (error) => {
        setLoading((_) => false);
      },
    });
  };

  function renderMessage() {
    let text = null;
    if (loading) {
      text = "Loading...";
    }

    if (!isAuthenticated) {
      text = "Login to see your credentials";
    }

    return <p className="text-gray-500">{text}</p>;
  }

  function renderButton() {
    if (loading) {
      return <div>Loading...</div>;
    }

    const cls =
      "inline-block px-5 py-3 mt-2 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-900 focus:outline-none focus:ring";

    if (isAuthenticated) {
      return (
        <Link to="/badges" className={cls}>
          Go to Credentials
        </Link>
      );
    }

    return (
      <button onClick={login} className={cls}>
        Login
      </button>
    );
  }

  return (
    <div className="grid px-4 bg-white place-content-center">
      <div className="text-center">
        <h1 className="font-black text-gray-200 text-9xl mt-24">Welcome</h1>
        <p className="text-2xl font-bold tracking-tight text-gray-900 mb-4 sm:text-4xl">ZHAW Micro-Credentials</p>
        {renderMessage()}
        {renderButton()}
      </div>
    </div>
  );
};
