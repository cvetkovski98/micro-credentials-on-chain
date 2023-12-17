import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { badgesAPI } from "../../badges/api/remote/badges";
import { ADMINISTRATION_ROLE_ID, Badge, LECTURER_ROLE_ID, isOK } from "../../badges/models";
import { ProtectedComponent } from "../../components/ProtectedRender";
import { useBackendActor } from "../../context/Global";

export const BadgeDetailsPage: React.FC = () => {
  const id = useParams<{ id: string }>().id || "";
  const actor = useBackendActor();

  const RemoteBadgesAPI = badgesAPI(actor);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [badge, setBadge] = React.useState<Badge>();

  const [revoked, setRevoked] = React.useState(false);
  const [revoking, setRevoking] = React.useState(false);

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
        {revoking && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Revoking...</strong>
          </div>
        )}
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
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 col-span-3">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {badge.isRevoked ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Revoked
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Valid
                    </span>
                  )}
                </dd>
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
                <dt className="text-sm font-medium text-gray-500">Issuer</dt>
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
        <ProtectedComponent roles={[ADMINISTRATION_ROLE_ID, LECTURER_ROLE_ID]}>
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:shadow-outline-red active:bg-red-700 transition ease-in-out duration-150"
              disabled={revoking || badge.isRevoked || revoked}
              onClick={() => {
                setRevoking(true);
                RemoteBadgesAPI.revokeOne(badge.badgeID)
                  .then((value) => {
                    if (isOK(value)) {
                      setRevoked(true);
                      setTimeout(() => {
                        window.location.reload();
                      }, 1300);
                    } else setError(value.error);
                  })
                  .catch((error) => {
                    setError(error.message);
                  })
                  .finally(() => {
                    setRevoking(false);
                  });
              }}
            >
              Revoke
            </button>
          </div>
        </ProtectedComponent>
      </div>
    </React.Fragment>
  );
};
