import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "../types";
import { getUsers } from "../services/api";

interface UserContextType {
  users: User[];
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then((data) => {
        setUsers(data);
        if (data.length > 0) {
          setCurrentUser(data[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{ users, currentUser, setCurrentUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
