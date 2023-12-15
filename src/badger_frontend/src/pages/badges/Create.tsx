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
import { useBackendActor } from "../../context/ActorContext";

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
      signedBy: [],
    };

    setLoading(true);
    RemoteBadgesAPI.createOne(payload)
      .then(() => {
        alert("Badge created successfully!");
        navigate("/badges");
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <React.Fragment>
      <div className="max-w-2xl mx-auto">
        <BadgeForm
          onSubmit={handleSubmit}
          organisations={organisations}
          students={students}
        />
      </div>
    </React.Fragment>
  );
};
