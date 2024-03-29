/* eslint-disable no-template-curly-in-string */
const { prepareCards } = require('./cards')

const config = {
  cards: {
    welcome: {
      title: 'welcome title',
      text: 'welcome text'
    },
    unknown: {
      title: 'unknown title',
      text: 'unknown text'
    },
    menu: {
      title: 'menu title',
      checkButton: {
        title: 'check button title',
        value: 'check button value'
      },
      resetButton: {
        title: 'reset button title',
        value: 'reset button value'
      },
      listButton: {
        title: 'list button title',
        value: 'list button value'
      }
    }
  }
}

describe('prepareCards()', () => {
  const cards = prepareCards(config)

  describe('welcomeCard()', () => {
    it('returns expected JSON object', () => {
      const welcomeCard = cards.welcomeCard()
      expect(welcomeCard).toMatchObject({
        type: 'message',
        attachmentLayout: 'list',
        attachments: [
          {
            content: {
              title: 'welcome title',
              text: 'welcome text'
            }
          }
        ]
      })
    })
  })

  describe('unknownCard()', () => {
    it('returns expected JSON object', () => {
      const unknownCard = cards.unknownCard()
      expect(unknownCard).toMatchObject({
        type: 'message',
        attachmentLayout: 'list',
        attachments: [
          {
            content: {
              title: 'unknown title',
              text: 'unknown text'
            }
          }
        ]
      })
    })
  })

  describe('menuCard()', () => {
    it('returns expected JSON object', () => {
      const menuCard = cards.menuCard()
      expect(menuCard).toMatchObject({
        type: 'message',
        attachmentLayout: 'list',
        attachments: [
          {
            content: {
              buttons: [
                {
                  title: 'check button title',
                  value: 'check button value',
                  type: 'imBack'
                },
                {
                  title: 'list button title',
                  value: 'list button value',
                  type: 'imBack'
                },
                {
                  title: 'reset button title',
                  value: 'reset button value',
                  type: 'imBack'
                }
              ],
              title: 'menu title'
            }
          }
        ]
      })
    })
  })
})
