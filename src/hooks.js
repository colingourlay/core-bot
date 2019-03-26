import React, { useEffect, useState } from 'react';

const REM = parseFloat(getComputedStyle(document.documentElement).fontSize);

export function useIntrinsicWidth(ref) {
  const [width, setWidth] = useState('auto');

  useEffect(() => {
    const { width, height } = ref.current.getBoundingClientRect();

    if (height < REM * 1.5) {
      // Not multi-line
      return;
    }

    setWidth(`${width}px`);
  }, [ref.current]);

  return width;
}

// Call this inside a component so that it locks the body on mount, and unlocks it on unmount
export function useLockBodyScroll() {
  useLayoutEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = originalStyle);
  }, []);
}
