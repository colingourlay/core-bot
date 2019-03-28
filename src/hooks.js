import React, { useEffect, useLayoutEffect, useState } from 'react';

export function useIntrinsicWidth(ref) {
  const [width, setWidth] = useState('auto');

  useEffect(() => {
    const { width, height } = ref.current.getBoundingClientRect();

    if (height < 24) {
      // Not multi-line
      return;
    }

    setWidth(`${width}px`);
  }, [ref.current]);

  return width;
}

export function useLockBodyScroll() {
  useLayoutEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = originalStyle);
  }, []);
}
