import { createContext, useMemo } from 'react';

interface LoaderContextValue {
  loading: boolean;
}

const LoaderContext = createContext<LoaderContextValue | null>(null);

export const LoaderContextProvider = ({ children }: { children?: unknown }): JSX.Element => {
  const value = useMemo<LoaderContextValue>(() => ({ loading: false }), []);
  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>;
};

export default LoaderContext;
