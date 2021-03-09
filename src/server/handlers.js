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

  /**
   * @param {import("restify").Request} req,
   * @param {import("restify").Response} res
   */
  const processMessage = (req, res) =>
    adapter.processActivity(req, res, async turnContext => {
      /* route to main dialog */
      await bot.run(turnContext)
    })

  /**
   * @param {string} user
   * @param {string} message
   * @param {boolean} mention
   */
  const notify = async (user, message, mention) => {
    const conversationRef = await storage.getConversation(user)
    if (!conversationRef) {
      throw new NotFoundError(`user not found: '${user}'`)
    }
    await conversationHelper.sendMessage(conversationRef, message, mention)
    return conversationRef.conversation.id
  }

  /**
   * @param {string} topic
   * @param {string} message
   * @param {boolean} mention
   */
  const broadcast = async (topic, message, mention) => {
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
        conversationHelper.sendMessage(conversationRef, message, mention)
      }
    }
    return conversationKeys
  }

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

  const getUsers = async () => {
    const users = await storage.listUsers()
    return users
  }

  /**
   * @param {string} topic
   */
  const createTopic = async topic => {
    await storage.registerTopic(topic) // may already exist
    return getTopics()
  }

  /**
   * @param {string} user
   * @param {string} topic
   */
  const forceSubscription = async (user, topic) => {
    await storage.subscribe(user, topic)
    const subscribers = await storage.getSubscribers(topic)
    return subscribers
  }

  return {
    processMessage,
    notify,
    broadcast,
    getTopics,
    getUsers,
    createTopic,
    forceSubscription
  }
}

module.exports = { createHandlers }
