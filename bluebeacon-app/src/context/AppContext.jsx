import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [role, setRole] = useState(null); // 'civilian' | 'officer' | 'judge'
  const [user, setUser] = useState(null);

  function login(selectedRole) {
    const profiles = {
      civilian: { name: 'Thabo M.', id: '···5082', avatar: 'T', role: 'civilian' },
      officer: { name: 'Sgt. N. Dlamini', id: 'CPT-0471', avatar: 'N', role: 'officer', station: 'Cape Town Central' },
      judge: { name: 'Judge S. van Wyk', id: 'JUD-0023', avatar: 'S', role: 'judge', court: 'Cape Town High Court' },
    };
    setRole(selectedRole);
    setUser(profiles[selectedRole]);
  }

  function logout() {
    setRole(null);
    setUser(null);
  }

  return (
    <AppContext.Provider value={{ role, user, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
