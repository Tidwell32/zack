import { useEffect, useState } from 'react';

export const useMediaQuery = (query: string) => {
  const [value, setValue] = useState(() => {
    if (typeof window !== 'undefined') {
      return matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    const result = matchMedia(query);
    result.addEventListener('change', onChange);

    // Sync with current state in case it changed between mount and effect
    queueMicrotask(() => {
      setValue(result.matches);
    });

    return () => {
      result.removeEventListener('change', onChange);
    };
  }, [query]);

  return value;
};
