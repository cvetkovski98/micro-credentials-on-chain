import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { badgesAPI } from "../../badges/api/remote/badges";
import { organisationsAPI } from "../../badges/api/remote/organisations";
import { usersAPI } from "../../badges/api/remote/users";
import { NewBadgeRequest, Organisation, STUDENT_ROLE_ID, User, isOK } from "../../badges/models";
import { BadgeForm, BadgeFormValues } from "../../components/forms/BadgeForm";
import { useBackendActor } from "../../context/Global";

export const BadgeCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const actor = useBackendActor();

  const RemoteBadgesAPI = badgesAPI(actor);
  const RemoteOrganisationsAPI = organisationsAPI(actor);
  const RemoteUsersAPI = usersAPI(actor);

  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [organisationsLoading, setOrganisationsLoading] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganisations();
  }, []);

  const fetchOrganisations = useCallback(async () => {
    setOrganisationsLoading(() => true);
    const resp = await RemoteOrganisationsAPI.getAll();
    if (isOK(resp)) {
      setOrganisations(resp.ok);

      const organisation_id = resp.ok[0].organisationID;
      fetchUsers(organisation_id, STUDENT_ROLE_ID);
    } else {
      setError(resp.error);
    }
    setOrganisationsLoading(() => false);
  }, [RemoteOrganisationsAPI]);

  const fetchUsers = useCallback(
    async (organisation_id: bigint, role_id: bigint) => {
      setUsersLoading(() => true);
      const resp = await RemoteUsersAPI.getAll([organisation_id], [role_id]);
      if (isOK(resp)) setUsers(resp.ok);
      else setError(resp.error);
      setUsersLoading(() => false);
    },
    [RemoteUsersAPI],
  );

  const handleOrganisationChange = (organisation_id: bigint) => {
    fetchUsers(organisation_id, STUDENT_ROLE_ID);
  };

  const handleSubmit = (values: BadgeFormValues) => {
    const payload: NewBadgeRequest = {
      ...values,
      description: values.description ? [values.description] : [],
      ownerID: BigInt(values.ownerID),
      issuerID: BigInt(values.issuerID),
      signedBy: [],
    };

    setSubmitting(true);

    RemoteBadgesAPI.createOne(payload)
      .then((resp) => {
        if (isOK(resp)) {
          setSuccess("Badge created successfully");
          setTimeout(() => {
            navigate("/badges");
          }, 2000);
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
        <BadgeForm
          onSubmit={handleSubmit}
          onOrganisationChange={handleOrganisationChange}
          organisations={organisations}
          users={users}
          disabled={organisationsLoading || usersLoading || submitting}
        />
      </div>
    </React.Fragment>
  );
};
