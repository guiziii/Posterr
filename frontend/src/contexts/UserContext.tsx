import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../types";
import { useUsers } from "../hooks/useUsers";
import { UserContext } from "./userContextDef";

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: users = [], isLoading } = useUsers();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const currentUser = selectedUser ?? users[0] ?? null;

  const value = useMemo(
    () => ({ users, currentUser, setCurrentUser: setSelectedUser, isLoading }),
    [users, currentUser, isLoading]
  );

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
