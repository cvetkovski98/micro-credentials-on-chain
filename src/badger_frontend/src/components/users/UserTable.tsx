import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../../badges/models";
import { UserTableItem } from "./UserTableItem";

interface UserTableProps {
  users: readonly User[];
}

const UserTableHeader = memo(() => (
  <thead>
    <tr>
      <th className="px-4 py-2">Name</th>
      <th className="px-4 py-2">Email</th>
      <th className="px-4 py-2">Organisation</th>
      <th className="px-4 py-2">Roles</th>
    </tr>
  </thead>
));

export const UserTable: React.FC<UserTableProps> = (props) => {
  const { users } = props;
  const navigate = useNavigate();

  return (
    <table className="table-auto w-full">
      <UserTableHeader />
      <tbody>
        {users.length == 0 ? (
          <tr>
            <td className="px-4 py-2" colSpan={4}>
              No users found.
            </td>
          </tr>
        ) : (
          users.map((item) => (
            <UserTableItem
              key={item.principalID}
              user={item}
              onClick={() => {
                navigate(`/users/${item.principalID}`);
              }}
            />
          ))
        )}
      </tbody>
    </table>
  );
};
