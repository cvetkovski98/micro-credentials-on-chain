import React, { useEffect, useState } from "react";
import {
  NewBadgeRequest,
  Organisation,
  Student,
  isOK,
} from "../../badges/models";
import { BadgeForm, BadgeFormValues } from "../../components/forms/BadgeForm";
import { useNavigate } from "react-router-dom";
import { badgesAPI } from "../../badges/api/remote/badges";
import { organisationsAPI } from "../../badges/api/remote/organisations";
import { studentsAPI } from "../../badges/api/remote/students";
import { useBackendActor } from "../../context/Global";

export const BadgeCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const actor = useBackendActor();

  const RemoteBadgesAPI = badgesAPI(actor);
  const RemoteOrganisationsAPI = organisationsAPI(actor);
  const RemoteStudentsAPI = studentsAPI(actor);

  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    RemoteOrganisationsAPI.getAll()
      .then((value) => {
        if (isOK(value)) setOrganisations(value.ok);
        else setError(value.error);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    RemoteStudentsAPI.getAll()
      .then((value) => {
        if (isOK(value)) setStudents(value.ok);
        else setError(value.error);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = (values: BadgeFormValues) => {
    const payload: NewBadgeRequest = {
      ...values,
      description: values.description ? [values.description] : [],
      ownerID: BigInt(values.ownerID),
      issuerID: BigInt(values.issuerID),
      signedBy: [],
    };

    setLoading(true);

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
        setLoading(false);
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
        <BadgeForm
          onSubmit={handleSubmit}
          organisations={organisations}
          students={students}
          disabled={loading}
        />
      </div>
    </React.Fragment>
  );
};
