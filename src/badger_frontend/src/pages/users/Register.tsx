import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { organisationsAPI } from "../../badges/api/remote/organisations";
import { usersAPI } from "../../badges/api/remote/users";
import { NewUserRequest, Organisation, Role, isOK } from "../../badges/models";
import { UserForm, UserFormValues } from "../../components/forms/UserForm";
import { useBackendActor, useUserSetter } from "../../context/Global";

export const UserRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const actor = useBackendActor();
  const updateUser = useUserSetter();

  const RemoteOrganisationsAPI = organisationsAPI(actor);
  const RemoteUsersAPI = usersAPI(actor);

  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function loadData() {
    setLoading(true);

    Promise.all([RemoteOrganisationsAPI.getAll(), RemoteUsersAPI.getAllRoles()])
      .then(([orgResponse, rolesResponse]) => {
        if (isOK(orgResponse)) setOrganisations(orgResponse.ok);
        else setError(orgResponse.error);

        if (isOK(rolesResponse)) setRoles(rolesResponse.ok);
        else setError(rolesResponse.error);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(loadData, []);

  const handleSubmit = (values: UserFormValues) => {
    const payload: NewUserRequest = {
      ...values,
      organisationID: BigInt(values.organisationID),
      roles: values.roles.map((r) => BigInt(r)),
    };

    setSubmitting(true);

    RemoteUsersAPI.createOne(payload)
      .then((resp) => {
        if (isOK(resp)) {
          setSuccess("User created successfully");
          updateUser(resp.ok);
          setTimeout(() => {
            navigate("/badges");
          }, 1300);
        } else {
          setError(resp.error);
        }
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <React.Fragment>
      <div className="max-w-2xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> {success}</span>
          </div>
        )}
        {submitting && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Submitting...</strong>
          </div>
        )}
        <UserForm
          onSubmit={handleSubmit}
          organisations={organisations}
          roles={roles}
          disabled={loading || submitting}
        />
      </div>
    </React.Fragment>
  );
};
