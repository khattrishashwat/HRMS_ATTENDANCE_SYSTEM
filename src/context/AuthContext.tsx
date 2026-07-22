import { createContext, useMemo } from 'react';

interface AuthContextValue {
  user: null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthContextProvider = ({ children }: { children?: unknown }): JSX.Element => {
  const value = useMemo<AuthContextValue>(() => ({ user: null, isAuthenticated: false }), []);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
