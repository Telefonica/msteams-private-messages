const { NotFoundError } = require('restify-errors')
const { log } = require('../log')
const { createConversationHelper } = require('./conversation-helper')

/**
 * Main Logic;
 * Connects: botframework - storage - API rest
 *
 * @param {import('botbuilder').BotFrameworkAdapter} adapter
 * @param {Types.Storage} storage
 * @param {import('botbuilder').ActivityHandler} bot
 * @return {Types.Handlers}
 */
const createHandlers = (adapter, storage, bot) => {
  const conversationHelper = createConversationHelper(adapter)

  /** @param {string} topic */
  const getTopic = async topic => {
    const subscribers = await storage.getSubscribers(topic)
    if (subscribers == null) {
      throw new NotFoundError(`topic not found: '${topic}'`)
    }
    return { name: topic, subscribers }
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
      topics,
      message,
      { ensureTopic } = {
        ensureTopic: false
      }
    ) => {
      const conversationKeys = []
      /** @type {string[]} */
      const usersNotified = []
      for (const topic of topics) {
        if (ensureTopic) {
          await storage.registerTopic(topic) // may already exist
        }
        const subscribers = await storage.getSubscribers(topic)
        for (const user of subscribers) {
          if (usersNotified.includes(user)) {
            log.debug(`User "${user}" already notified`)
          } else {
            const conversationRef = await storage.getConversation(user)
            if (!conversationRef) {
              log.warn(
                `weird status: user "${user}" seems to be subscribed to "${topic}" but conversationRef not found. SKIPPING.`
              )
            } else {
              conversationKeys.push(conversationRef.conversation.id)
              log.debug(`Broadcast message sent to user: "${user}"`)
              conversationHelper.sendMessage(conversationRef, message)
              usersNotified.push(user)
            }
          }
        }
      }
      return conversationKeys
    },

    getUsers: async () => {
      const users = await storage.listUsers()
      return users
    },

    getUser: async user => {
      const subscriptions = await storage.getSubscribedTopics(user)
      if (subscriptions == null) {
        throw new NotFoundError(`user not found: '${user}'`)
      }
      return { user, subscriptions }
    },

    getTopics: async () => {
      return await storage.listTopics()
    },

    getTopic,

    createTopic: async topic => {
      await storage.registerTopic(topic) // may already exist
      return getTopic(topic)
    },

    removeTopic: async topic => {
      const formerSubscribers = await storage.getSubscribers(topic)
      if (formerSubscribers == null) {
        throw new NotFoundError(`topic not found: '${topic}'`)
      }
      const cancelSubscriptionTasks = formerSubscribers.map(user => {
        return () => storage.cancelSubscription(user, topic)
      })
      await Promise.all(cancelSubscriptionTasks.map(t => t()))
      await storage.removeTopic(topic)
      return await storage.listTopics()
    },

    forceSubscription: async (user, topic) => {
      const subscriptions = await storage.getSubscribedTopics(user)
      if (subscriptions == null) {
        throw new NotFoundError(`user not found: '${user}'`)
      }
      await storage.subscribe(user, topic)
      return getTopic(topic)
    },

    cancelSubscription: async (user, topic) => {
      const subscriptions = await storage.getSubscribedTopics(user)
      if (subscriptions == null) {
        throw new NotFoundError(`user not found: '${user}'`)
      }
      const formerSubscribers = await storage.getSubscribers(topic)
      if (formerSubscribers == null) {
        throw new NotFoundError(`topic not found: '${topic}'`)
      }
      await storage.cancelSubscription(user, topic)
      return getTopic(topic)
    }
  }
}

module.exports = { createHandlers }
