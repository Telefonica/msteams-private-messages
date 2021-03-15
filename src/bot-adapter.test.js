const { BotFrameworkAdapter } = require('botbuilder')
const { createBotAdapter } = require('./bot-adapter')

jest.mock('botbuilder')

describe('createBotAdapter()', () => {
  afterEach(() => {
    // @ts-ignore
    BotFrameworkAdapter.mockClear()
  })
  describe('depending on "runningLocally" opt...', () => {
    it('returns a local BotFrameworkAdapter', () => {
      createBotAdapter({ runningLocally: true })
      expect(BotFrameworkAdapter).toHaveBeenCalledWith({
        appId: null,
        appPassword: null
      })
    })
    it('returns a remote BotFrameworkAdapter', () => {
      createBotAdapter({
        runningLocally: false,
        microsoftAppId: 'APP ID',
        microsoftAppPassword: 'APP PASSWORD'
      })
      expect(BotFrameworkAdapter).toHaveBeenCalledWith({
        appId: 'APP ID',
        appPassword: 'APP PASSWORD'
      })
    })
  })
})
