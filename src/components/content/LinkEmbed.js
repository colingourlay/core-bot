import React from 'react';
import { useStyle } from 'styled-hooks';
import ImageEmbed from './ImageEmbed';

const DEFAULT_IMAGE_ASPECT_RATIO = 0.66;

export default function LinkEmbed({ url, title, imageSrc, imageAspectRatio }) {
  const className = useStyle`
    display: block;
    border-radius: inherit;
    max-width: ${imageSrc ? '280px' : 'auto'};
    cursor: pointer;
  `;
  const textClassName = useStyle`
    display: flex;
    align-items: center;
    margin: 12px 8px 12px 16px;

    & svg {
      flex: 0 0 auto;
      margin-left: 8px;
    }

    & h3 {
      overflow: hidden;
      margin: 0;
      font-family: ABCSans;
      font-size: 13px;
      font-weight: 400;
      line-height: 1.4;
      letter-spacing: 0.25px;
      white-space: ${title ? 'normal' : 'nowrap'};
      text-overflow: ${title ? 'normal' : 'ellipsis'};
    }
  `;

  const _url = new URL(url);
  const linkText = title || `${_url.hostname}${_url.pathname === '/' ? '' : _url.pathname}`;

  return (
    <a className={className} href={url}>
      {imageSrc && <ImageEmbed src={imageSrc} aspectRatio={imageAspectRatio || DEFAULT_IMAGE_ASPECT_RATIO} />}
      <div className={textClassName}>
        <h3>{linkText}</h3>
        <svg role="presentation" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
          <path d="M12 7v1.5H6.5v9h9V12H17v7H5V7h7zm1-2h6v6h-1.5V7.5L12.1 13 11 12l5.5-5.5H13V5z" />
        </svg>
      </div>
    </a>
  );
}
