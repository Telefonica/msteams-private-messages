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

const run = async () => {
  log.info('[STARTUP]', log.fields.name)
  log.info('[STARTUP]', '.env file read')

  const adapter = createBotAdapter()
  const storage = await createStorage()
  const bot = createBot(storage)
  const conversation = createConversation(adapter)

  /** @type {Types.Handlers} */
  const handlers = {
    processMessage: (req, res) =>
      adapter.processActivity(req, res, async turnContext => {
        /* route to main dialog */
        await bot.run(turnContext)
      }),

    notify: async (user, message, mention) => {
      const conversationRef = await storage.getConversation(user)
      if (!conversationRef) {
        return {
          status: 404,
          response: {
            code: 'NotFound',
            input: { user }
          }
        }
      }
      await conversation.sendMessage(conversationRef, message, mention)
      return {
        status: 202,
        response: { conversationKey: conversationRef.conversation.id }
      }
    },

    broadcast: async (topic, message, mention) => {
      const subscribers = await storage.getSubscribers(topic)
      const conversationKeys = []
      for (const user of subscribers) {
        const conversationRef = await storage.getConversation(user)
        if (!conversationRef) {
          log.warn(
            `weird status: user "${user}" seems to be subscribed to "${topic}" but conversationRef not found. SKIPPING.`
          )
        } else {
          conversationKeys.push(conversationRef.conversation.id)
          conversation.sendMessage(conversationRef, message, mention)
        }
      }
      return {
        status: 202,
        response: { conversationKeys }
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
      return { status: 200, response: topics }
    },

    getUsers: async () => {
      const users = await storage.listUsers()
      return { status: 200, response: users }
    },

    createTopic: async topic => {
      const created = await storage.registerTopic(topic)
      const topicNames = await storage.listTopics()
      const status = created ? 201 : 200
      return { status, response: topicNames }
    },

    forceSubscription: async (user, topic) => {
      const success = await storage.subscribe(user, topic)
      const subscriptions = await storage.getSubscribedTopics(user)
      const status = success && subscriptions ? 200 : 500
      return { status, response: subscriptions }
    }
  }

  createServer(handlers).start()
}

try {
  run()
} catch (err) {
  log.fatal(err)
}
