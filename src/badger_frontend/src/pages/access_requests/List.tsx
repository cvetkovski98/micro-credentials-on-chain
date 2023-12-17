import React, { useEffect } from "react";
import { accessRequestsAPI } from "../../badges/api/remote/access_requests";
import { AccessRequest, isOK } from "../../badges/models";
import { useBackendActor } from "../../context/Global";

export const AccessRequestListPage: React.FC = () => {
  const actor = useBackendActor();

  const RemoteAccessRequestsAPI = accessRequestsAPI(actor);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [accessRequests, setAccessRequests] = React.useState<AccessRequest[]>([]);

  useEffect(loadData, []);

  function loadData() {
    setLoading(true);

    RemoteAccessRequestsAPI.getAll()
      .then((response) => {
        if (isOK(response)) setAccessRequests(response.ok);
        else setError(response.error);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function handleApprove(accessRequestID: bigint) {
    RemoteAccessRequestsAPI.approveOne(accessRequestID)
      .then((response) => {
        if (isOK(response)) {
          alert(`Successfully approved access request ${accessRequestID}`);
          loadData();
        } else {
          setError(response.error);
        }
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Access Requests</h1>
      <table>
        <thead>
          <tr>
            <th>Badge Title</th>
            <th>Requester Name</th>
            <th>Requester Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {accessRequests.map((accessRequest) => (
            <tr key={accessRequest.accessRequestID}>
              <td>{accessRequest.badge.title}</td>
              <td>{accessRequest.user.name}</td>
              <td>{accessRequest.user.email}</td>
              <td>
                <button onClick={() => handleApprove(accessRequest.accessRequestID)}>Approve</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
