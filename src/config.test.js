const { readConfig } = require('./config')

describe('readConfig()', () => {
  it('returns the .yaml file as js obj', () => {
    // when
    const config = readConfig('config.example')

    // then
    expect(config).toEqual({
      cards: {
        welcomeCard: {
          title: 'Welcome to the Private Notifications Center',
          text: ''
        },
        unknownCard: {
          title: '',
          text: 'Unknown command...'
        },
        menuCard: {
          title: 'Available Options',
          checkButton: {
            title: 'Check my subscribed notifications 🧾',
            value: 'check'
          },
          resetButton: {
            title: 'Reset all my subscribed notifications ❌',
            value: 'reset'
          },
          subscriptionButtons: [
            {
              title: 'Subscribe to banana notifications 🍌',
              value: 'banana'
            },
            {
              title: 'Subscribe to apple notifications 🍎',
              value: 'apple'
            },
            {
              title: 'Subscribe to orange notifications 🍊',
              value: 'orange'
            }
          ]
        }
      }
    })
  })
})
