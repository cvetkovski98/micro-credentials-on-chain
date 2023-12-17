import React, { memo } from "react";
import { User } from "../../badges/models";

interface UserTableItemProps {
  user: User;
  onClick: (user: User) => void;
}

export const UserTableItem = memo((props: UserTableItemProps) => {
  const { user } = props;

  return (
    <tr className="hover:bg-gray-100 cursor-pointer" onClick={() => props.onClick(user)}>
      <td className="border px-4 py-2">{user.name}</td>
      <td className="border px-4 py-2">{user.email}</td>
      <td className="border px-4 py-2">{user.organisation.name}</td>
      <td className="border px-4 py-2">{user.roles.map((r) => r.name).join(", ")}</td>
    </tr>
  );
});
