import { useEffect, useState } from "react";

/**
 * Debounces a changing value. Useful for search inputs so APIs are not
 * called on every keystroke.
 */
const useDebounce = <T,>(value: T, delayMs = 400): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [value, delayMs]);

  return debouncedValue;
};

export default useDebounce;
