import VisuallyHidden from '@reach/visually-hidden';
import React from 'react';
import { useLockBodyScroll } from '../../hooks';

export default function ScrollLock() {
  useLockBodyScroll();

  return <VisuallyHidden>A modal chat is currently open, which stops the page from scrolling</VisuallyHidden>;
}
