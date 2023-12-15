import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../badges/models";
import { BadgeTableItem } from "./BadgeTableItem";

interface BadgeTableProps {
  badges: readonly Badge[];
}

const BadgeTableHeader = memo(() => (
  <thead>
    <tr>
      <th className="px-4 py-2">Badge ID</th>
      <th className="px-4 py-2">Title</th>
      <th className="px-4 py-2">Description</th>
      <th className="px-4 py-2">Type</th>
    </tr>
  </thead>
));

export const BadgeTable: React.FC<BadgeTableProps> = (props) => {
  const { badges } = props;
  const navigate = useNavigate();

  return (
    <table className="table-auto w-full">
      <BadgeTableHeader />
      <tbody>
        {badges.length == 0 ? (
          <tr>
            <td className="px-4 py-2" colSpan={4}>
              No badges found.
            </td>
          </tr>
        ) : (
          badges.map((item) => (
            <BadgeTableItem
              key={item.badgeID}
              badge={item}
              onClick={() => {
                navigate(`/badges/${item.badgeID}`);
              }}
            />
          ))
        )}
      </tbody>
    </table>
  );
};
