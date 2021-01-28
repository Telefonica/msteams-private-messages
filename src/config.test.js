const { readConfig } = require('./config')

const DEFAULT_EXAMPLE_CONFIG = {
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
}

describe('readConfig()', () => {
  it('returns the .yaml file as js obj', () => {
    const config = readConfig('config.example')
    expect(config).toEqual(DEFAULT_EXAMPLE_CONFIG)
  })
  it('returns the default (example) file if file not found', () => {
    const config = readConfig('does.not.exist')
    expect(config).toEqual(DEFAULT_EXAMPLE_CONFIG)
  })
})
