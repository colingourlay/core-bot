import React from 'react';

export default function Icons() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
      <defs>
        <path
          d="M2 2.5h20v15H7l-3.3 4H2v-19zM3.5 4v15L6 16h14.5V4h-17zM7 9.003h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"
          id="text-sms-a"
        />
      </defs>
      <symbol viewBox="0 0 24 24" id="dls-icon-close-circled">
        <g fill="none" fillRule="evenodd">
          <path d="M0 0h24v24H0z" />
          <path
            d="M12 3a9 9 0 1 0 .001 18.001A9 9 0 0 0 12 3zm4.54 12.254l-1.286 1.248L12 13.318l-3.214 3.235-1.366-1.299 3.274-3.27L7.42 8.746 8.786 7.5l3.218 3.146 3.25-3.146 1.286 1.246-3.226 3.238 3.226 3.27z"
            fill="currentColor"
            fillRule="nonzero"
          />
        </g>
      </symbol>
      <symbol viewBox="0 0 24 24" id="dls-icon-close">
        <g fill="none" fillRule="evenodd">
          <path d="M0 0h24v24H0z" />
          <path
            d="M3 4.5L4.5 3l7.5 7.5L19.5 3 21 4.5 13.5 12l7.5 7.5-1.5 1.5-7.5-7.5L4.5 21 3 19.5l7.5-7.5L3 4.5z"
            fill="currentColor"
          />
        </g>
      </symbol>
      <symbol viewBox="0 0 24 24" id="dls-icon-comments">
        <g fill="none" fillRule="evenodd">
          <path d="M0 0h24v24H0z" />
          <path fill="currentColor" d="M4 4.55v14.9l4.927-5.122H20V4.55z" />
        </g>
      </symbol>
      <symbol viewBox="0 0 24 24" id="dls-icon-text-sms">
        <g fill="none" fillRule="evenodd">
          <path d="M0 0h24v24H0z" />
          <use fill="currentColor" xlinkHref="#text-sms-a" />
        </g>
      </symbol>
    </svg>
  );
}
