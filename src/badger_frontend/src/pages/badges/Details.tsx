import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { badgesAPI } from "../../badges/api/remote/badges";
import { Badge, isOK } from "../../badges/models";
import { useBackendActor } from "../../context/Global";

export const BadgeDetailsPage: React.FC = () => {
  const id = useParams<{ id: string }>().id || "";
  const actor = useBackendActor();

  const RemoteBadgesAPI = badgesAPI(actor);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [badge, setBadge] = React.useState<Badge>();

  useEffect(() => {
    const badgeID: bigint = BigInt(id);
    setLoading(true);
    RemoteBadgesAPI.getOne(badgeID)
      .then((value) => {
        if (isOK(value)) setBadge(value.ok);
        else setError(value.error);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading || !badge) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <React.Fragment>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Badge Details</h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 col-span-3">
                <dt className="text-sm font-medium text-gray-500">Badge ID</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{badge.badgeID.toString()}</dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Badge Title</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{badge?.title}</dd>
              </div>
              <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Badge Type</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {badge?.badgeType} - {badge?.badgeType === 0 ? "Goal" : "Package"}
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Badge Description</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{badge?.description}</dd>
              </div>
              <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Issuer ID</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {badge.issuer.organisationID.toString()} - {badge.issuer.name}
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Owner</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {badge.owner.principalID.toString()} - {badge.owner.name}
                </dd>
              </div>
              <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                {badge.claims && badge.claims.length <= 0 && (
                  <dt className="text-sm font-medium text-gray-500">No claims</dt>
                )}
                {badge.claims?.map((claim, index) => (
                  <React.Fragment key={index}>
                    <dt className="text-sm font-medium text-gray-500">Claim #{index + 1}</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {claim.key} - {claim.value}
                    </dd>
                  </React.Fragment>
                ))}
              </div>
            </dl>
          </div>
          <div className="px-4 py-3 text-sm text-gray-400 overflow- sm:px-6">
            <h4 className="text-sm leading-6 font-medium text-gray-900">
              <span className="mr-2">Signed by:</span>
            </h4>
            <p className="text-xs break-words leading-5 font-mono">{badge.signedBy.join(", ")}</p>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
