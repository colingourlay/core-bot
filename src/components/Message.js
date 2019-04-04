import React from 'react';
import { useStyle } from 'styled-hooks';

export default function Message({ isInverted = false, markup, label }) {
  const className = useStyle`
    margin: 12px 16px;
    color: ${isInverted ? '#fff' : '#000'};
    font-family: ABCSans;
    font-size: 15px;
    line-height: 1.5;
    letter-spacing: 0.25px;
  
    & a {
      color: ${isInverted ? 'inherit' : '#002aff'};
      text-decoration: ${isInverted ? 'underline' : 'none'};;
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

    & .only-emoji,
    & .icon-emoji {
      font-size: 1.8em;
      line-height: 0;
    }

    & .has-icon-emoji {
      display: flex;
      align-items: center;
    }

    & .icon-emoji {
      flex: 0 0 auto;
    }

    & .icon-emoji:first-child {
      margin-right: 10px;
    }

    & .icon-emoji:last-child {
      margin-left: 10px;
    }

    & img.emoji {
      margin: 0 0.1em;
      height: 1.33em;
      width: 1.33em;
      vertical-align: -0.33em;
    }
  `;

  return (
    <div
      className={className}
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: markup }}
      data-sketch-symbol={process.env.NODE_ENV === 'production' ? null : 'Message'}
    />
  );
}
