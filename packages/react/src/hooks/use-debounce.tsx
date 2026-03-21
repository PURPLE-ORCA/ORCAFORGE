import { useEffect, useState } from "react";

/**
 * A hook that delays updating a value until a specified delay has passed.
 * value : The value to debounce
 * delay : The delay in milliseconds
 * it return The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
