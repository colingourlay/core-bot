__corebot__ = {
  id: 'DEV',
  title: 'Example Bot',
  text: {
    type: 'element',
    tagname: 'div',
    children: [
      {
        type: 'element',
        tagname: 'p',
        children: [
          {
            type: 'text',
            content: '#startTHENaORb'
          }
        ]
      },
      {
        type: 'element',
        tagname: 'h2',
        children: [
          {
            type: 'text',
            content: "What's an Example Bot?"
          }
        ]
      },
      {
        type: 'element',
        tagname: 'p',
        children: [
          {
            type: 'text',
            content: 'This is an '
          },
          {
            type: 'element',
            tagname: 'em',
            children: [
              {
                type: 'text',
                content: 'example'
              }
            ]
          },
          {
            type: 'text',
            content: ' bot script'
          }
        ]
      },
      {
        type: 'element',
        tagname: 'p',
        children: [
          {
            type: 'text',
            content: "You'll be able to choose Question A or Question B"
          }
        ]
      },
      {
        type: 'element',
        tagname: 'p',
        children: [
          {
            type: 'text',
            content: '#aTHENb'
          }
        ]
      },
      {
        type: 'element',
        tagname: 'h2',
        children: [
          {
            type: 'text',
            content: 'Question A'
          }
        ]
      },
      {
        type: 'element',
        tagname: 'p',
        children: [
          {
            type: 'element',
            tagname: 'a',
            parameters: {
              href: 'https://giphy.com/gifs/shaq-shimmy-UO5elnTqo4vSg/'
            },
            children: [
              {
                type: 'text',
                content: '[gif]'
              }
            ]
          }
        ]
      },
      {
        type: 'element',
        tagname: 'p',
        children: [
          {
            type: 'text',
            content: 'This is Answer A'
          }
        ]
      },
      {
        type: 'element',
        tagname: 'p',
        children: [
          {
            type: 'text',
            content: 'This has an emoji 💜. The next couple are only emoji'
          }
        ]
      },
      {
        type: 'element',
        tagname: 'p',
        children: [
          {
            type: 'text',
            content: '❤️:green_heart:💙'
          }
        ]
      },
      {
        type: 'element',
        tagname: 'p',
        children: [
          {
            type: 'text',
            content: '😀😃😄😁'
          }
        ]
      },
      {
        type: 'element',
        tagname: 'p',
        children: [
          {
            type: 'text',
            content: 'This ends with an emoji :poop:'
          }
        ]
      },
      {
        type: 'element',
        tagname: 'p',
        children: [
          {
            type: 'text',
            content: 'This ends with an emoji and should span a couple of lines 💜'
          }
        ]
      },
      {
        type: 'element',
        tagname: 'p',
        children: [
          {
            type: 'text',
            content: 'This ends with an emoji and should definitely span more than a couple of lines 💜'
          }
        ]
      },
      {
        type: 'element',
        tagname: 'p',
        children: [
          {
            type: 'text',
            content: 'This ends with an emoji 💜 but also has one earlier 💜'
          }
        ]
      },
      {
        type: 'element',
        tagname: 'p',
        children: [
          {
            type: 'text',
            content: '#bTHENa'
          }
        ]
      },
      {
        type: 'element',
        tagname: 'h2',
        children: [
          {
            type: 'text',
            content: '💜 Question B'
          }
        ]
      },
      {
        type: 'element',
        tagname: 'p',
        children: [
          {
            type: 'element',
            tagname: 'a',
            parameters: {
              href: 'https://gfycat.com/infamousmeagerhackee'
            },
            children: [
              {
                type: 'text',
                content: '[gif]'
              }
            ]
          }
        ]
      },
      {
        type: 'element',
        tagname: 'p',
        children: [
          {
            type: 'text',
            content: 'This is Answer B'
          }
        ]
      }
    ]
  }
};

try {
  module.exports = __corebot__;
} catch (e) {}
