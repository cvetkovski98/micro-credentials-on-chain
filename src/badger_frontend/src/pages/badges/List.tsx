import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { badgesAPI } from "../../badges/api/remote/badges";
import { ADMINISTRATION_ROLE_ID, Badge, LECTURER_ROLE_ID, isOK } from "../../badges/models";
import { ProtectedComponent } from "../../components/ProtectedRender";
import { BadgeTable } from "../../components/badges/BadgeTable";
import { useBackendActor } from "../../context/Global";

export const BadgeListPage: React.FC = () => {
  const actor = useBackendActor();

  const RemoteBadgesAPI = badgesAPI(actor);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    setLoading(true);
    RemoteBadgesAPI.getAll([], [])
      .then((value) => {
        if (isOK(value)) setBadges(value.ok);
        else setError(value.error);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (error) return <div>{error}</div>;

  return (
    <React.Fragment>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold mb-2">Badges</h1>
        <ProtectedComponent roles={[ADMINISTRATION_ROLE_ID, LECTURER_ROLE_ID]}>
          <Link to="/badges/create" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Create Badge
          </Link>
        </ProtectedComponent>
      </div>

      {loading ? <div>Loading...</div> : <BadgeTable badges={badges} />}
    </React.Fragment>
  );
};
