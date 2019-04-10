import { useEffect, useState } from 'react';

export const useViewportHeight = () => {
  const [height, setHeight] = useState(window.innerHeight);
  const onResize = () => setSize(window.innerHeight);

  useEffect(() => {
    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, []);

  return height;
};
