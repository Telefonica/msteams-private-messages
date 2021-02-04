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

  notify: async (username, message, mention) => {
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
    await conversation.sendMessage(conversationRef, message, mention)

    return {
      status: 202,
      response: { conversationRef }
    }
  },

  broadcast: async (topic, message, mention) => {
    const subscribers = storage.getSubscribers(topic)
    const conversationRefs = []
    for (const username of subscribers) {
      const conversationRef = storage.getConversation(username)
      if (!conversationRef) {
        log.warn(
          'weird status: user "%s" seems to be subscribed to "%s" but conversationRef not found\nSKIPPING.',
          username,
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
    const topicNames = storage.listTopics()
    /** @type {{[name: string]: string[]}} */
    const topics = topicNames.reduce((acc, cur) => {
      // @ts-ignore
      acc[cur] = []
      return acc
    }, {})
    for (const topic of topicNames) {
      topics[topic] = topics[topic].concat(storage.getSubscribers(topic))
    }
    log.debug(topics)
    return { status: 200, response: topics }
  },

  getUsernames: async () => {
    return { status: 200, response: storage.listUsernames() }
  },

  getChannelNames: async () => {
    return { status: 200, response: storage.listChannelNames() }
  }
}

createServer(handlers)
