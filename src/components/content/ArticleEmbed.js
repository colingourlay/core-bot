import React from 'react';
import { useStyle } from 'styled-hooks';
import ImageEmbed from './ImageEmbed';

export default function ArticleEmbed({ url, title, thumbnail }) {
  const className = useStyle`
    display: block;
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
    width: 280px;
    max-width: 100%;
    cursor: pointer;

    & > span {
      display: flex;
      align-items: center;
      margin: 12px 8px 12px 16px;
    }

    & svg {
      flex: 0 0 auto;
      margin-left: 8px;
    }

    & h3 {
      margin: 0;
      font-family: ABCSans;
      font-size: 13px;
      font-weight: 400;
      line-height: 1.4;
      letter-spacing: 0.25px;
    }
  `;

  return (
    <a className={className} href={url} data-sketch-symbol={process.env.NODE_ENV === 'production' ? null : 'Article'}>
      {thumbnail && <ImageEmbed {...thumbnail} />}
      <span>
        <h3>{title}</h3>
        <svg role="presentation" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
          <path d="M12 7v1.5H6.5v9h9V12H17v7H5V7h7zm1-2h6v6h-1.5V7.5L12.1 13 11 12l5.5-5.5H13V5z" />
        </svg>
      </span>
    </a>
  );
}
