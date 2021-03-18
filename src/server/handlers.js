const { NotFoundError } = require('restify-errors')
const { log } = require('../log')
const { createConversationHelper } = require('./conversation-helper')

/**
 *
 * @param {import('botbuilder').BotFrameworkAdapter} adapter
 * @param {Types.Storage} storage
 * @param {import('botbuilder').ActivityHandler} bot
 * @return {Types.Handlers}
 */
const createHandlers = (adapter, storage, bot) => {
  const conversationHelper = createConversationHelper(adapter)

  const getTopics = async () => {
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
    return topics
  }

  return {
    processMessage: (req, res) =>
      adapter.processActivity(req, res, async turnContext => {
        /* route to main dialog */
        await bot.run(turnContext)
      }),

    notify: async (user, message, opts) => {
      const conversationRef = await storage.getConversation(user)
      if (!conversationRef) {
        throw new NotFoundError(`user not found: '${user}'`)
      }
      await conversationHelper.sendMessage(conversationRef, message, opts)
      return conversationRef.conversation.id
    },

    broadcast: async (
      topic,
      message,
      { ensureTopic } = {
        ensureTopic: false
      }
    ) => {
      if (ensureTopic) {
        await storage.registerTopic(topic) // may already exist
      }
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
          conversationHelper.sendMessage(conversationRef, message)
        }
      }
      return conversationKeys
    },

    getTopics,

    getUsers: async () => {
      const users = await storage.listUsers()
      return users
    },

    createTopic: async topic => {
      await storage.registerTopic(topic) // may already exist
      return getTopics()
    },

    removeTopic: async topic => {
      const formerSubscribers = await storage.getSubscribers(topic)
      const cancelSubscriptionTasks = formerSubscribers.map(user => {
        return () => storage.cancelSubscription(user, topic)
      })
      await Promise.all(cancelSubscriptionTasks)
      await storage.removeTopic(topic)
      return getTopics()
    },

    forceSubscription: async (user, topic) => {
      await storage.subscribe(user, topic)
      const subscribers = await storage.getSubscribers(topic)
      return subscribers
    },

    cancelSubscription: async (user, topic) => {
      await storage.cancelSubscription(user, topic)
      const currentSubscribers = await storage.getSubscribers(topic)
      return currentSubscribers
    }
  }
}

module.exports = { createHandlers }
