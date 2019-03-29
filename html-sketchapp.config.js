module.exports = {
  puppeteerArgs: '--ignore-certificate-errors',
  url: 'https://localhost:8000',
  viewports: {
    Desktop: '1024x768',
    Mobile: '375x667'
  },
  outDir: 'sketch'
};
