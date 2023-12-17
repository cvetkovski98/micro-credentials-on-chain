import React, { useEffect, useState } from "react";
import { usersAPI } from "../../badges/api/remote/users";
import { User, isOK } from "../../badges/models";
import { UserTable } from "../../components/users/UserTable";
import { useBackendActor } from "../../context/Global";

export const UserListPage: React.FC = () => {
  const actor = useBackendActor();

  const RemoteUsersAPI = usersAPI(actor);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setLoading(true);
    RemoteUsersAPI.getAll([], [])
      .then((value) => {
        if (isOK(value)) setUsers(value.ok);
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
        <h1 className="text-3xl font-bold mb-2">Users</h1>
      </div>

      {loading ? <div>Loading...</div> : <UserTable users={users} />}
    </React.Fragment>
  );
};
