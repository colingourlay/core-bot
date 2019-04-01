import React, { useLayoutEffect, useRef } from 'react';
import { useStyle } from 'styled-hooks';

export default function Message({ markup, isGuest = false, box, parentBox, isLast, /*sink*/ children, ...props }) {
  const className = useStyle`
    transform-origin: top right;
    position: relative;
    align-self: ${isGuest ? 'flex-end' : 'flex-start'};
    box-sizing: content-box;
    /* margin: ${
      isGuest ? `16px 0 ${box && parentBox ? `${parentBox.height - box.height}px` : 0} 16px` : '32px 16px 0 0'
    }; */
    margin: ${isGuest ? `16px 0 0 16px` : '32px 16px 0 0'};
    border-radius: ${isGuest ? '4px 0 0 12px' : ' 0 4px 12px 0'};
    padding: 10px 16px;
    max-width: calc(100% - 16px);
    background-color: ${isGuest ? '#144f66' : '#fff'};
    box-shadow: ${isGuest ? '0 5px 20px 0  rgba(20, 79, 102, 0.15)' : '0 5px 20px 0  rgba(20, 79, 102, 0.3)'};

    &[data-actor="host"] {
      animation: enterHost .25s forwards;

      &::before {
        content: 'ABC News Bot';
        position: absolute;
        top: -20px;
        left: 16px;
        color: #144f66;
        font-family: ABCSans;
        font-size: 11px;
        font-weight: 300;
        letter-spacing: 0.25px;
        white-space: nowrap;
      }

      @keyframes enterHost {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    }

    &[data-actor="host"] + &[data-actor="host"] {
      margin-top: 10px;

      &::before {
        content: none;
      }
    }

    &[data-actor="guest"] {
      transition: margin-bottom .25s;

      &::after {
        content: '';
        z-index: -1;
        position: absolute;
        top: 0;
        left: 0;
        border-radius: inherit;
        width: ${box ? box.width : 0}px;
        height: 100%;
        background-color: inherit;
      }
    }
  `;

  const contentClassName = useStyle`
    transform-origin: top left;
    color: ${isGuest ? '#fff' : '#000'};
    font-family: ABCSans;
    font-size: 15px;
    line-height: 1.5;
    letter-spacing: 0.25px;
    
    & a {
      color: #002aff;
      text-decoration: none;
    }

    & > :first-child {
      margin-top: 0;
    }

    & > :last-child {
      margin-bottom: 0;
    }

    & > li {
      list-style-position: inside;
    }
  `;

  const ref = useRef();

  useLayoutEffect(() => {
    if (isGuest && isLast && box) {
      const el = ref.current;
      const from = box;
      const to = el.getBoundingClientRect();
      const diff = {
        x: from.left - to.left,
        y: from.top - to.top
      };

      el.animate(
        [
          {
            offset: 0,
            opacity: 1,
            transform: `translate(${diff.x}px, ${diff.y}px)`,
            borderRadius: '4px',
            boxShadow: '0 5px 20px 0  rgba(20, 79, 102, 0)',
            easing: 'cubic-bezier(0.25, 0.5, 0.25, 1)'
          },
          {
            offset: 0.33,
            transform: `translate(0, ${diff.y}px)`,
            borderRadius: '4px',
            boxShadow: '0 5px 20px 0  rgba(20, 79, 102, 0)',
            easing: 'cubic-bezier(0.25, 0.5, 0.25, 1)'
          },
          {
            opacity: 1,
            transform: 'none',
            borderRadius: '4px 0 0 12px',
            boxShadow: '0 5px 20px 0  rgba(20, 79, 102, 0.15)'
          }
        ],
        {
          duration: 500,
          fill: 'forwards'
        }
      );
    }
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ marginBottom: box && parentBox && isLast ? `${parentBox.height - box.height}px` : 0 }}
      data-actor={isGuest ? 'guest' : 'host'}
      data-sketch-symbol={`Message/${isGuest ? 'Guest' : 'Host'}`}
      {...props}
    >
      <div className={contentClassName} dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  );
}
