const { sequelize } = require('../../db/sequelize/models')
const { log } = require('../log')

/** @type {import('sequelize').Sequelize} */
const db = sequelize

const tryConnection = async () => {
  try {
    await db.authenticate()
    log.info('[STARTUP] db connection has been established successfully')
  } catch (err) {
    log.error('[STARTUP] unable to connect to the database', err)
    throw err
  }
}

const Topics = db.models.Topics
const Conversations = db.models.Conversations

/**
 * @param {string} user
 * @param {Partial<Types.ConversationReference>} conversationRef
 */
const saveConversation = async (user, conversationRef) => {
  const conversationKey = conversationRef.conversation.id
  log.debug(`[db] updating conversation #${conversationKey}`)
  return Conversations.findOrCreate({
    where: { user },
    defaults: {
      user,
      conversationKey,
      conversationRef
    }
  })
    .then(([conversation, created]) => {
      if (created) {
        log.debug('[db] created new conversation', conversation)
      }
      // FIXME check conversationKey?
      return true
    })
    .catch(err => {
      log.error('[db] unable to create conversation', err)
      return false
    })
}

/**
 * @param {string} user
 * @return {Promise<Partial<Types.ConversationReference> | null>}
 */
const getConversation = async user => {
  log.debug(`[db] reading conversation for user "${user}"`)
  return Conversations.findOne({ where: { user } })
    .then(conversation => {
      log.debug(`[db] recovered conversation for user "${user}"`)
      // @ts-ignore
      return conversation.conversationRef
    })
    .catch(err => {
      log.error(`[db] unable to find Conversation for user "${user}"`, err)
      return null
    })
}

/**
 * @param {string} topic
 * @return {Promise<import('sequelize').Model | null>}
 */
const ensureTopic = async topic => {
  log.debug(`[db] ensuring topic: "${topic}"`)
  return Topics.findOrCreate({ where: { name: topic } })
    .then(([topicInstance, created]) => {
      if (created) {
        log.debug(`[db] registered new topic "${topic}"`)
      }
      return topicInstance
    })
    .catch(err => {
      log.error(`[db] unable to create topic "${topic}"`, err)
      return null
    })
}

/**
 * @param {string} topic
 * @return {Promise<boolean>}
 */
const registerTopic = async topic =>
  ensureTopic(topic).then(instance => !!instance)

/**
 * @param {string} user
 * @return {Promise<{conversation: any, topics: string[]|null}>}
 */
const getDetailedConversation = async user => {
  log.debug(`[db] reading subscriptions for user "${user}"`)
  return Conversations.findOne({ where: { user }, include: ['subscriptions'] })
    .then(conversation => ({
      conversation,
      // @ts-ignore
      topics: conversation.subscriptions.map(topic => topic.name)
    }))
    .catch(err => {
      log.error(`[db] unable to read subscriptions for user "${user}"`, err)
      return null
    })
}

/**
 * @param {string} user
 * @return {Promise<string[]|null>}
 */
const getSubscribedTopics = async user =>
  getDetailedConversation(user).then(({ topics }) => topics)

/**
 * @param {string} user
 * @param {string} topic
 * @return {Promise<boolean>}
 */
const subscribe = async (user, topic) => {
  log.debug(`[db] updating <user-topic>: <${user}, ${topic}>`)
  return getDetailedConversation(user)
    .then(({ conversation, topics }) => {
      if (topics.indexOf(topic) >= 0) {
        log.debug(`[db] already subscribed <user-topic> <${user}-${topic}>`)
        return true
      }
      return ensureTopic(topic).then(topicInstance =>
        // @ts-ignore
        conversation.addSubscription(topicInstance.id)
      )
    })
    .catch(err => {
      log.error(`[db] unable to update <user-topic>: <${user}, ${topic}>`, err)
      return false
    })
}

/**
 * @param {string} topic
 * @return {Promise<string[]|null>}
 */
const getSubscribers = async topic => {
  log.debug(`[db] reading subscribers of "${topic}"`)
  return Topics.findOne({ where: { name: topic }, include: 'subscribers' })
    .then(topicInstance => {
      // FIXME check this condition
      if (!topicInstance) {
        log.debug(`[db] topic "${topic}" not found`)
        return null
      }
      // @ts-ignore
      return topicInstance.subscribers.map(conversation => conversation.user)
    })
    .catch(err => {
      log.error(`[db] unable to read subscribers of "${topic}"`, err)
      return null
    })
}

/**
 * @return {Promise<string[]>}
 */
const listTopics = async () => {
  return Topics.findAll({})
    .then(topics => {
      log.debug(`[db] recovered ${topics.length} topics`)
      // @ts-ignore
      return topics.map(topic => topic.name)
    })
    .catch(err => {
      log.error('[db] unable to list Conversations', err)
      return []
    })
}

/**
 * @return {Promise<string[]>}
 */
const listUsers = async () => {
  return Conversations.findAll({})
    .then(conversations => {
      log.debug(`[db] recovered ${conversations.length} conversations`)
      // @ts-ignore
      return conversations.map(conversation => conversation.user)
    })
    .catch(err => {
      log.error('[db] unable to list Conversations', err)
      return []
    })
}

/**
 * @param {string} user
 * @return {Promise<boolean>}
 */
const resetSubscriptions = async user => {
  log.debug(`[db] removing every subscription for user "${user}"`)
  return Conversations.findOne({ where: { user }, include: ['subscriptions'] })
    .then(conversation => {
      // FIXME check this condition
      if (!conversation) {
        log.debug(`[db] user "${user}" not found`)
        return false
      }
      // @ts-ignore
      return conversation.setSubscriptions([]).then(() => {
        log.debug(`[db] removed every subscription for user "${user}"`)
        return true
      })
    })
    .catch(err => {
      log.error(`[db] unable to remove subscriptions for user "${user}"`, err)
      return false
    })
}

/**
 * @param {string} topic
 * @return {Promise<boolean>}
 */
const removeSubscribers = async topic => {
  log.debug(`[db] removing every subscriber to topic "${topic}"`)
  return Topics.findOne({ where: { name: topic }, include: 'subscribers' })
    .then(topicInstance => {
      // FIXME check this condition
      if (!topicInstance) {
        log.debug(`[db] topic "${topic}" not found`)
        return false
      }
      // @ts-ignore
      return topicInstance.setSubscribers([]).then(() => {
        log.debug(`[db] removed every subscriber to topic "${topic}"`)
        return true
      })
    })
    .catch(err => {
      log.error(`[db] unable to remove subscribers to "${topic}"`, err)
      return false
    })
}

/**
 * @type {Types.Storage}
 */
const storage = {
  saveConversation,
  getConversation,
  registerTopic,
  subscribe,
  getSubscribedTopics,
  getSubscribers,
  listUsers,
  listTopics,
  resetSubscriptions,
  removeSubscribers
}

module.exports = {
  tryConnection,
  storage
}
