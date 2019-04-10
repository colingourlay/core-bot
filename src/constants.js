const MOCK_ELEMENT = { getAttribute: () => '' };

export const PARENT_ID = (document.querySelector(`meta[name="ContentId"]`) || MOCK_ELEMENT).getAttribute('content');

export const IS_DEBUG = String(window.location.host).indexOf('aus.aunty') > -1;

export const DEFAULTS = {
  AUTHOR: 'ABC News Bot',
  START_CTA: 'Ask the ABC News Bot',
  RESUME_CTA: 'Return to the chat'
};

export const CUBIC_BEZIER_EASING = 'cubic-bezier(0.25, 0.5, 0.25, 1)';
