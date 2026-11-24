"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type RoleType = "ADMIN" | "MANAGER" | "CLIENT";

interface UserRoleContextType {
  role: RoleType;
  setRole: (role: RoleType) => void;
  isAdmin: boolean;
  isManager: boolean;
  isClient: boolean;
}

const UserRoleContext = createContext<UserRoleContextType>({
  role: "ADMIN",
  setRole: () => {},
  isAdmin: true,
  isManager: false,
  isClient: false,
});

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<RoleType>("ADMIN");

  useEffect(() => {
    const saved = localStorage.getItem("markethub_user_role") as RoleType | null;
    if (saved && (saved === "ADMIN" || saved === "MANAGER" || saved === "CLIENT")) {
      setRoleState(saved);
    }
  }, []);

  const setRole = (newRole: RoleType) => {
    setRoleState(newRole);
    localStorage.setItem("markethub_user_role", newRole);
  };

  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";
  const isClient = role === "CLIENT";

  return (
    <UserRoleContext.Provider value={{ role, setRole, isAdmin, isManager, isClient }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  return useContext(UserRoleContext);
}

