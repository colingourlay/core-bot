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
  
  a[name^='corebot']:not(:empty) {
    clear: right;
    float: right;
    margin: 0 0 16px 16px;
    width: calc(50% - 8px);
    max-width: 175px;
    min-width: 150px;
    color: inherit;
    text-decoration: none;
  }  
`;
