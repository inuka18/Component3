import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "inspid-tech-role";

export const ROLES = {
  PM: "pm",
  MEMBER: "member",
};

// The two demo personas. Reused verbatim from the mock team roster
// (see src/data/mockTeam.js) so "logged in as" always matches a real row
// in the Team page for whichever project is active.
const PERSONAS = {
  [ROLES.PM]: {
    name: "Tharindu Bandara",
    initials: "TB",
    email: "tharindu.bandara@inspid-tech.dev",
    title: "Project Manager",
    role: ROLES.PM,
  },
  [ROLES.MEMBER]: {
    name: "Kavindu Silva",
    initials: "KS",
    email: "kavindu.silva@inspid-tech.dev",
    title: "Frontend Developer",
    role: ROLES.MEMBER,
  },
};

const RoleContext = createContext(null);

function getInitialRole() {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === ROLES.PM || stored === ROLES.MEMBER) return stored;
  } catch {
    // localStorage unavailable, start logged out.
  }
  return null;
}

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(getInitialRole);

  useEffect(() => {
    try {
      if (role) window.localStorage.setItem(STORAGE_KEY, role);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore write failures; role still applies for this session.
    }
  }, [role]);

  const login = useCallback((nextRole) => {
    if (nextRole === ROLES.PM || nextRole === ROLES.MEMBER) setRoleState(nextRole);
  }, []);

  const switchRole = login; // Same operation: top bar switcher just re-logs-in as the other persona.

  const logout = useCallback(() => setRoleState(null), []);

  const isAuthenticated = role !== null;
  const currentUser = role ? PERSONAS[role] : null;

  return (
    <RoleContext.Provider
      value={{ role, currentUser, isAuthenticated, login, switchRole, logout, PERSONAS, ROLES }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
