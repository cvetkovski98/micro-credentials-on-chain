import React, { memo } from "react";
import { Badge } from "../../badges/models";

interface BadgeTableItemProps {
  badge: Badge;
  onClick: (badge: Badge) => void;
}

export const BadgeTableItem = memo((props: BadgeTableItemProps) => {
  const { badge } = props;

  const badgeType = badge.badgeType === 0 ? "Goal" : "Package";

  return (
    <tr
      className="hover:bg-gray-100 cursor-pointer"
      onClick={() => props.onClick(badge)}
    >
      <td className="border px-4 py-2">{badge.badgeID.toString()}</td>
      <td className="border px-4 py-2">{badge.title}</td>
      <td className="border px-4 py-2">{badge.description}</td>
      <td className="border px-4 py-2">{badgeType}</td>
    </tr>
  );
});
