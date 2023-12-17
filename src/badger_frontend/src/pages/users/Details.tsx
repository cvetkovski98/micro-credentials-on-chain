import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { accessRequestsAPI } from "../../badges/api/remote/access_requests";
import { badgesAPI } from "../../badges/api/remote/badges";
import { usersAPI } from "../../badges/api/remote/users";
import { Badge, COMPANY_ROLE_ID, User, isOK } from "../../badges/models";
import { ProtectedComponent } from "../../components/ProtectedRender";
import { useBackendActor } from "../../context/Global";

export const UserDetailsPage: React.FC = () => {
  const id = useParams<{ id: string }>().id || "";
  const actor = useBackendActor();

  const RemoteUsersAPI = usersAPI(actor);
  const RemoteBadgesAPI = badgesAPI(actor);
  const RemoteAccessRequestsAPI = accessRequestsAPI(actor);

  const [user, setUser] = React.useState<User>();
  const [badges, setBadges] = React.useState<Badge[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const [loading, setLoading] = React.useState(true);
  const [requesting, setRequesting] = React.useState<boolean>(false);
  const [success, setSuccess] = React.useState<boolean>(false);

  function loadData() {
    setLoading(true);

    Promise.all([RemoteUsersAPI.getOne(id), RemoteBadgesAPI.getAll([id], [])])
      .then(([userResponse, badgesResponse]) => {
        if (isOK(userResponse)) setUser(userResponse.ok);
        else setError(userResponse.error);

        if (isOK(badgesResponse)) setBadges(badgesResponse.ok);
        else setError(badgesResponse.error);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function requestAccess(badgeID: bigint) {
    setRequesting(true);
    setSuccess(false);
    setError(null);

    RemoteAccessRequestsAPI.createOne(badgeID)
      .then((response) => {
        if (isOK(response)) {
          setSuccess(true);
        } else {
          setError(response.error);
        }
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setRequesting(false);
      });
  }

  useEffect(() => {
    loadData();
  }, [id]);

  return (
    <React.Fragment>
      <div className="max-w-2xl mx-auto">
        {requesting && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Requesting access...</strong>
          </div>
        )}
        {(loading || !user) && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Loading...</strong>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline">Successfully requested access to badge.</span>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error!</strong>
            <span className="block ml-1 sm:inline">{error}</span>
          </div>
        )}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">User Details</h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 col-span-3">
                <dt className="text-sm font-medium text-gray-500">User ID</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.principalID.toString()}</dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">User Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.name}</dd>
              </div>
              <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">User Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.email}</dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Organisation</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user?.organisation.organisationID.toString()} - {user?.organisation.name}
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                {user?.roles?.map((role, index) => (
                  <React.Fragment key={index}>
                    <dt className="text-sm font-medium text-gray-500">Role #{index + 1}</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {role.roleID.toString()} - {role.name}
                    </dd>
                  </React.Fragment>
                ))}
              </div>
              <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">User Badges</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 space-y-4">
                  {badges.length == 0 ? (
                    <div>No badges found.</div>
                  ) : (
                    badges.map((badge) => (
                      <div className="flex flex-row items-center text-sm font-medium space-x-4">
                        <div className="w-3/4">
                          <h4>{badge.title}</h4>
                          <p className="text-gray-500 overflow-ellipsis">{badge.description}</p>
                        </div>
                        <ProtectedComponent roles={[COMPANY_ROLE_ID]}>
                          <div
                            onClick={() => requestAccess(badge.badgeID)}
                            className="cursor-pointer font-medium text-blue-600 dark:text-blue-500 hover:underline"
                          >
                            Get access
                          </div>
                        </ProtectedComponent>
                      </div>
                    ))
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
