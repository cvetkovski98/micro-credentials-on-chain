import React, { memo } from "react";
import { AccessRequest } from "../../badges/models";

interface AccessRequestTableItemProps {
  request: AccessRequest;
  onApprove: (request: AccessRequest) => void;
}

export const AccessRequestTableItem = memo((props: AccessRequestTableItemProps) => {
  const { request } = props;

  return (
    <tr className="hover:bg-gray-100 cursor-pointer">
      <td className="border px-4 py-2">{request.badge.title}</td>
      <td className="border px-4 py-2">{request.user.name}</td>
      <td className="border px-4 py-2">{request.user.email}</td>
      <td className="border px-4 py-2">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => props.onApprove(request)}
        >
          Approve
        </button>
      </td>
    </tr>
  );
});

interface AccessRequestTableProps {
  requests: readonly AccessRequest[];
  onApprove: (request: AccessRequest) => void;
}

const AccessRequestTableHeader = memo(() => (
  <thead>
    <tr>
      <th className="px-4 py-2">Badge Title</th>
      <th className="px-4 py-2">Requester name</th>
      <th className="px-4 py-2">Requester email</th>
      <th className="px-4 py-2">Actions</th>
    </tr>
  </thead>
));

export const AccessRequestTable: React.FC<AccessRequestTableProps> = (props) => {
  const { requests } = props;

  return (
    <table className="table-auto w-full">
      <AccessRequestTableHeader />
      <tbody>
        {requests.length == 0 ? (
          <tr>
            <td className="px-4 py-2" colSpan={4}>
              No requests found.
            </td>
          </tr>
        ) : (
          requests.map((item) => (
            <AccessRequestTableItem key={item.accessRequestID} request={item} onApprove={props.onApprove} />
          ))
        )}
      </tbody>
    </table>
  );
};
