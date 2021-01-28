const dotenv = require('dotenv')
const path = require('path')

/* load .env file before instanciating dependent objects (do NOT move) */
dotenv.config({ path: path.join(__dirname, '.env') })

const { log } = require('./src/log')
const { createBotAdapter } = require('./src/bot-adapter')
const { createBot } = require('./src/bot')
const { createServer } = require('./src/server')
const { createStorage } = require('./src/storage')

log.info('[STARTUP]', log.fields.name)
log.info('[STARTUP]', '.env file read')

const adapter = createBotAdapter()
const storage = createStorage()
const bot = createBot(storage)

const handlers = {
  processMessage: async (req, res) => {
    adapter.processActivity(req, res, async turnContext => {
      /* route to main dialog */
      await bot.run(turnContext)
    })
  },

  notify: async (username, message) => {
    const conversationRef = storage.getConversation(username)
    if (!conversationRef) {
      return {
        status: 404,
        response: {
          code: 'NotFound',
          input: { username, message }
        }
      }
    }

    /**
     * @doc https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-proactive-message?view=azure-bot-service-4.0&tabs=javascript
     */
    await adapter.continueConversation(conversationRef, async context => {
      const conversationId = conversationRef.conversation.id
      log.debug('conversation #%s restored', conversationId)
      try {
        await context.sendActivity(message)
      } catch (err) {
        log.error(err, 'sending activity to conversation #%s', conversationId)
      }
    })

    return {
      status: 202,
      response: { conversationRef }
    }
  },

  broadcast: async (topic, message) => {
    storage.getSubscriptions()
    return {
      response: null
    }
  }
}

createServer(handlers)
