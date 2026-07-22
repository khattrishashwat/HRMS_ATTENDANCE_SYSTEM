import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface ThemeContextValue {
  darkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  darkMode: false,
  toggleTheme: () => undefined,
});

export const ThemeContextProvider = ({
  children,
}: {
  children?: ReactNode;
}): JSX.Element => {
  const [darkMode, setDarkMode] = useState(false);
  const toggleTheme = useCallback(() => setDarkMode((v) => !v), []);
  const value = useMemo(
    () => ({ darkMode, toggleTheme }),
    [darkMode, toggleTheme]
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
