import VisuallyHidden from '@reach/visually-hidden';
import React, { useLayoutEffect } from 'react';

const MESSAGE = 'An ABC News Chat Bot dialog is currently open, which stops the page from scrolling';

export default function ScrollLock() {
  useLayoutEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = originalStyle);
  }, []);

  return <VisuallyHidden>{MESSAGE}</VisuallyHidden>;
}
