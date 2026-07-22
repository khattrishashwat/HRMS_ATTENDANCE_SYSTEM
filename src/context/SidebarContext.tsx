import { createContext, useMemo } from 'react';

interface SidebarContextValue {
  collapsed: boolean;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export const SidebarContextProvider = ({ children }: { children?: unknown }): JSX.Element => {
  const value = useMemo<SidebarContextValue>(() => ({ collapsed: false }), []);
  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

export default SidebarContext;
