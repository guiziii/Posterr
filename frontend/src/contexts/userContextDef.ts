import { createContext } from "react";
import type { User } from "../types";

export interface UserContextType {
  users: User[];
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  isLoading: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);
