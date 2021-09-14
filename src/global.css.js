import { injectGlobal } from 'styled-hooks';

injectGlobal`
  @font-face {
    font-family: ABCSans;
    font-display: swap;
    src: url('//www.abc.net.au/res/fonts/abcsans/abcsans-light.woff') format('woff');
    font-weight: 300;
    font-style: normal;
    font-stretch: normal;
  }
  
  @font-face {
    font-family: ABCSans;
    font-display: swap;
    src: url('//www.abc.net.au/res/fonts/abcsans/abcsans-regular.woff') format('woff');
    font-weight: 400;
    font-style: normal;
    font-stretch: normal;
  }
  
  @font-face {
    font-family: ABCSans;
    font-display: swap;
    src: url('//www.abc.net.au/res/fonts/abcsans/abcsans-regularitalic.woff') format('woff');
    font-weight: 400;
    font-style: italic;
    font-stretch: normal;
  }
  
  @font-face {
    font-family: ABCSans;
    font-display: swap;
    src: url('//www.abc.net.au/res/fonts/abcsans/abcsans-bold.woff') format('woff');
    font-weight: 600;
    font-style: normal;
    font-stretch: normal;
  }
  
  @font-face {
    font-family: ABCSans;
    font-display: swap;
    src: url('//www.abc.net.au/res/fonts/abcsans/abcsans-black.woff') format('woff');
    font-weight: 800;
    font-style: normal;
    font-stretch: normal;
  }
  
  [data-mount][id^='corebot']:not(:empty) {
    clear: both;
    margin-bottom: 16px;
    width: 100%;
    min-width: 150px;
  }

  [data-mount][id^='corebot'][data-embed="full"] {
    margin: 0 auto 1.5rem;
    max-width: 360px;
  }

  [data-mount][id^='corebot'][data-embed="left"],
  [data-mount][id^='corebot'][data-embed="right"] {
    width: calc(50% - 8px);
    max-width: 175px;
  }

  [data-mount][id^='corebot'][data-embed="left"] {
    clear: left;
    float: left;
    margin-right: 16px;
  }

  [data-mount][id^='corebot'][data-embed="right"] {
    clear: right;
    float: right;
    margin-left: 16px;
  }
`;
