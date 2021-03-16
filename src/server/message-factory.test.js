const { defineMessageAsActivity } = require('./message-factory')

describe('defineMessageAsActivity()', () => {
  /** @type {Types.Context} context */
  const mockedContext = {
    activity: {
      // @ts-ignore
      from: {
        name: 'Jane Doe'
      }
    }
  }

  describe('returns expected JSON obj', () => {
    ;[
      {
        desc: 'accepts plain Strings',
        input: 'Greetings from Megacoorp',
        expectedOutput: {
          entities: [
            {
              mentioned: {
                name: 'Jane Doe'
              },
              text: '<at>74,97,110,101,32,68,111,101</at>',
              type: 'mention'
            }
          ],
          inputHint: 'acceptingInput',
          text: 'Greetings from Megacoorp <at>74,97,110,101,32,68,111,101</at>',
          type: 'message'
        }
      },
      {
        desc: 'accepts Adaptive Cards',
        input: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.2',
          body: [
            {
              type: 'Container',
              items: [
                {
                  type: 'TextBlock',
                  text: 'Lorem Ipsum',
                  size: 'Medium',
                  wrap: true
                },
                {
                  type: 'TextBlock',
                  text: 'Greetings from Megacoorp',
                  isSubtle: true,
                  spacing: 'None',
                  wrap: true
                }
              ]
            }
          ]
        },
        expectedOutput: {
          type: 'message',
          inputHint: 'acceptingInput',
          attachmentLayout: 'list',
          attachments: [
            {
              content: {
                $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                body: [
                  {
                    items: [
                      {
                        size: 'Medium',
                        text: 'Lorem Ipsum',
                        type: 'TextBlock',
                        wrap: true
                      },
                      {
                        isSubtle: true,
                        spacing: 'None',
                        text: 'Greetings from Megacoorp',
                        type: 'TextBlock',
                        wrap: true
                      }
                    ],
                    type: 'Container'
                  }
                ],
                type: 'AdaptiveCard',
                version: '1.2'
              },
              contentType: 'application/vnd.microsoft.card.adaptive'
            }
          ]
        }
      },
      {
        desc: 'accepts Rich Cards',
        input: {
          type: 'message',
          inputHint: 'acceptingInput',
          attachmentLayout: 'list',
          attachments: [
            {
              contentType: 'application/vnd.microsoft.card.hero',
              content: {
                title: 'Some Title',
                buttons: [
                  {
                    title: 'Button no. 1',
                    value: 'one',
                    type: 'imBack'
                  },
                  {
                    title: 'Button no. 2',
                    value: 'two',
                    type: 'imBack'
                  }
                ]
              }
            }
          ]
        },
        expectedOutput: {
          type: 'message',
          inputHint: 'acceptingInput',
          attachmentLayout: 'list',
          attachments: [
            {
              contentType: 'application/vnd.microsoft.card.hero',
              content: {
                title: 'Some Title',
                buttons: [
                  {
                    title: 'Button no. 1',
                    value: 'one',
                    type: 'imBack'
                  },
                  {
                    title: 'Button no. 2',
                    value: 'two',
                    type: 'imBack'
                  }
                ]
              }
            }
          ]
        }
      }
    ].forEach(({ desc, input, expectedOutput }) => {
      it(desc, () => {
        const messageAsActivity = defineMessageAsActivity(
          mockedContext,
          input,
          { includeMention: true }
        )
        expect(messageAsActivity).toEqual(expectedOutput)
      })
    })
  })
})
