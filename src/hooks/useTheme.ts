const useTheme = (): { theme: 'light' | 'dark'; setTheme: (theme: 'light' | 'dark') => void } => ({
  theme: 'light',
  setTheme: (_theme: 'light' | 'dark'): void => {},
});

export default useTheme;
