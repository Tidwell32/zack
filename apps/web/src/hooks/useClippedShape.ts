import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

import type { ClipSize } from '@/types';
import { clipSizes } from '@/utils';

export const useClippedShape = <T extends HTMLElement = HTMLDivElement>(clipSize: ClipSize, children: ReactNode) => {
  const wrapperRef = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!wrapperRef.current) return;

    const el = wrapperRef.current;

    const update = () => {
      if (!wrapperRef.current) return;
      setSize({
        width: wrapperRef.current.offsetWidth,
        height: wrapperRef.current.offsetHeight,
      });
    };

    const ro = new ResizeObserver(update);
    ro.observe(el);

    update();

    return () => {
      ro.disconnect();
    };
  }, [children]);

  const { width, height } = size;

  const bevelBase = clipSizes[clipSize];

  return {
    wrapperRef,
    size: { width, height },
    bevelBase,
  };
};
