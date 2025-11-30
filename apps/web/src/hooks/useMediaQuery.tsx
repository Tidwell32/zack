import { useEffect, useState } from 'react';

// Breakpoint presets
const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
  wide: 1536,
} as const;

type BreakpointKey = keyof typeof BREAKPOINTS;
type Direction = 'max' | 'min';

const buildMediaQuery = (breakpoint: BreakpointKey | number, direction: Direction = 'max'): string => {
  const value = typeof breakpoint === 'number' ? breakpoint : BREAKPOINTS[breakpoint];
  return `(${direction}-width: ${value}px)`;
};

export const useMediaQuery = (breakpoint: BreakpointKey | number, direction: Direction = 'max') => {
  const query = buildMediaQuery(breakpoint, direction);

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

    queueMicrotask(() => {
      setValue(result.matches);
    });

    return () => {
      result.removeEventListener('change', onChange);
    };
  }, [query]);

  return value;
};
