const dotenv = require('dotenv')
const path = require('path')

/* load .env file before instanciating dependent objects (do NOT move) */
dotenv.config({ path: path.join(__dirname, '.env') })

const { log } = require('./src/log')
const { createBotAdapter } = require('./src/bot-adapter')
const { createBot } = require('./src/bot')
const { createServer } = require('./src/server')
const { createStorage } = require('./src/storage')
const { createConversation } = require('./src/conversation')

log.info('[STARTUP]', log.fields.name)
log.info('[STARTUP]', '.env file read')

const adapter = createBotAdapter()
const storage = createStorage()
const bot = createBot(storage)
const conversation = createConversation(adapter)

/** @type {Types.Handlers} */
const handlers = {
  processMessage: async (req, res) => {
    adapter.processActivity(req, res, async turnContext => {
      /* route to main dialog */
      await bot.run(turnContext)
    })
  },

  notify: async (user, message, mention) => {
    const conversationRef = await storage.getConversation(user)
    if (!conversationRef) {
      return {
        status: 404,
        response: {
          code: 'NotFound',
          input: { user, message }
        }
      }
    }
    await conversation.sendMessage(conversationRef, message, mention)

    return {
      status: 202,
      response: { conversationRef }
    }
  },

  broadcast: async (topic, message, mention) => {
    const subscribers = await storage.getSubscribers(topic)
    const conversationRefs = []
    for (const user of subscribers) {
      const conversationRef = await storage.getConversation(user)
      if (!conversationRef) {
        log.warn(
          'weird status: user "%s" seems to be subscribed to "%s" but conversationRef not found\nSKIPPING.',
          user,
          topic
        )
      } else {
        conversationRefs.push(conversationRef)
        conversation.sendMessage(conversationRef, message, mention)
      }
    }
    return {
      status: 202,
      response: { conversationRefs }
    }
  },

  getTopics: async () => {
    const topicNames = await storage.listTopics()
    /** @type {{[name: string]: string[]}} */
    const topics = topicNames.reduce((acc, cur) => {
      // @ts-ignore
      acc[cur] = []
      return acc
    }, {})
    for (const topic of topicNames) {
      const subscribers = await storage.getSubscribers(topic)
      topics[topic] = topics[topic].concat(subscribers)
    }
    log.debug(topics)
    return { status: 200, response: topics }
  },

  getUsers: async () => {
    const users = await storage.listUsers()
    return { status: 200, response: users }
  }
}

createServer(handlers)
