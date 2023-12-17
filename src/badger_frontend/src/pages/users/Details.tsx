import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { badgesAPI } from "../../badges/api/remote/badges";
import { usersAPI } from "../../badges/api/remote/users";
import { Badge, User, isOK } from "../../badges/models";
import { useBackendActor } from "../../context/Global";

export const UserDetailsPage: React.FC = () => {
  const id = useParams<{ id: string }>().id || "";
  const actor = useBackendActor();

  const RemoteUsersAPI = usersAPI(actor);
  const RemoteBadgesAPI = badgesAPI(actor);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<User>();
  const [badges, setBadges] = React.useState<Badge[]>([]);

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

  useEffect(loadData, [id]);

  if (loading || !user) {
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
            <h3 className="text-lg leading-6 font-medium text-gray-900">User Details</h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 col-span-3">
                <dt className="text-sm font-medium text-gray-500">User ID</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.principalID.toString()}</dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">User Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.name}</dd>
              </div>
              <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">User Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Organisation</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.organisation.organisationID.toString()} - {user.organisation.name}
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                {user.roles?.map((role, index) => (
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
                        <div className="cursor-pointer font-medium text-blue-600 dark:text-blue-500 hover:underline">
                          Get access
                        </div>
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
