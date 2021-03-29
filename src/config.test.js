/* eslint-disable no-template-curly-in-string */
const { readConfig } = require('./config')

const DEFAULT_EXAMPLE_CONFIG = {
  cards: {
    welcome: {
      title: 'Welcome to the Private Notifications Center',
      text: ''
    },
    unknown: {
      title: '',
      text: 'Unknown command...'
    },
    menu: {
      title: 'Available Options',
      checkButton: {
        title: 'Check my subscribed topics ✅',
        value: 'check'
      },
      listButton: {
        title: 'List every available topic 🔘',
        value: 'list'
      },
      resetButton: {
        title: 'Reset all my subscribed topics ❌',
        value: 'reset'
      }
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
