import { User } from "../badges/models";

export function hasRoleIDs(user: User, roleIDs: bigint[]): boolean {
  const userRoleIDs = user.roles.map((role) => role.roleID);
  return userRoleIDs.some((roleID) => roleIDs.includes(roleID));
}
