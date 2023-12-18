import React, { useEffect } from "react";
import { accessRequestsAPI } from "../../badges/api/remote/access_requests";
import { AccessRequest, isOK } from "../../badges/models";
import { AccessRequestTable } from "../../components/access_requests/AccessRequestTable";
import { useBackendActor } from "../../context/Global";

export const AccessRequestListPage: React.FC = () => {
  const actor = useBackendActor();

  const RemoteAccessRequestsAPI = accessRequestsAPI(actor);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [accessRequests, setAccessRequests] = React.useState<AccessRequest[]>([]);
  const [approving, setApproving] = React.useState(false);

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
    setApproving(true);
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
      })
      .finally(() => {
        setApproving(false);
      });
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <React.Fragment>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold mb-2">Access Requests</h1>
      </div>

      {approving && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Approving request...</strong>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <AccessRequestTable requests={accessRequests} onApprove={(req) => handleApprove(req.accessRequestID)} />
      )}
    </React.Fragment>
  );
};
