const { sequelize } = require('../../db/sequelize/models')
const { log } = require('../log')

/** @type {import('sequelize').Sequelize} */
const db = sequelize

const tryConnection = async () => {
  try {
    await db.authenticate()
    log.info('[STARTUP] db connection has been established successfully')
    return true
  } catch (err) {
    log.error('[STARTUP] unable to connect to the database', err)
    return false
  }
}

const Topics = db.models.Topics
const Users = db.models.Users

/**
 * @param {string} user
 * @param {Partial<Types.ConversationReference>} conversationRef
 */
const saveConversation = async (user, conversationRef) => {
  const conversationKey = conversationRef.conversation.id
  log.debug(`[db] updating conversation #${conversationKey} (user: "${user}")`)
  return Users.findOrCreate({
    where: { user },
    defaults: {
      user,
      conversationKey,
      conversationRef
    }
  })
    .then(([userInstance, created]) => {
      if (created) {
        log.debug(`[db] created new user: "${user}"`)
        return true
        // @ts-ignore
      } else if (userInstance.conversationKey !== conversationKey) {
        log.warn(`[db] need to update conversationRef for user "${user}"`)
        // @ts-ignore
        userInstance.conversationKey = conversationKey
        // @ts-ignore
        userInstance.conversationRef = conversationRef
        return userInstance.save().then(() => true)
      } else {
        return true
      }
    })
    .catch(err => {
      log.error(`[db] unable to create user "${user}`, err)
      return false
    })
}

/**
 * @param {string} user
 * @return {Promise<Partial<Types.ConversationReference> | null>}
 */
const getConversation = async user => {
  log.debug(`[db] reading conversation for user "${user}"`)
  return Users.findOne({ where: { user } })
    .then(userInstance => {
      log.debug(`[db] recovered conversation for user "${user}"`)
      // @ts-ignore
      return userInstance.conversationRef
    })
    .catch(err => {
      log.error(`[db] unable to find User "${user}"`, err)
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
 * @param {string} topic
 * @return {Promise<boolean>}
 */
const removeTopic = async topic => {
  log.debug(`[db] removing topic: "${topic}"`)
  return Topics.destroy({ where: { name: topic } })
    .then(affectedRows => {
      if (affectedRows === 1) {
        log.debug(`[db] removed topic "${topic}"`)
        return true
      }
      log.warn(`[db] unexpected affected rows removing topic "${topic}"`)
      return false
    })
    .catch(err => {
      log.error(`[db] unable to remove topic "${topic}"`, err)
      return false
    })
}

/**
 * @param {string} user
 * @return {Promise<{userInstance: any, topics: string[]}|null>}
 */
const getAllUserInfo = async user => {
  log.debug(`[db] reading subscriptions for user "${user}"`)
  return Users.findOne({ where: { user }, include: ['subscriptions'] })
    .then(userInstance =>
      userInstance
        ? {
            userInstance,
            // @ts-ignore
            topics: userInstance.subscriptions.map(topic => topic.name)
          }
        : null
    )
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
  getAllUserInfo(user)
    .then(({ topics }) => topics)
    .catch(() => null)

/**
 * @param {string} user
 * @param {string} topic
 * @return {Promise<boolean>}
 */
const subscribe = async (user, topic) => {
  log.debug(`[db] subscribing <user-topic>: <${user}, ${topic}>`)
  return getAllUserInfo(user)
    .then(userInfo => {
      if (!userInfo) {
        return false
      }
      const { userInstance, topics } = userInfo
      if (topics.includes(topic)) {
        log.debug(`[db] already subscribed <user-topic> <${user}-${topic}>`)
        return true
      }
      return ensureTopic(topic).then(topicInstance =>
        // @ts-ignore
        userInstance.addSubscription(topicInstance.id)
      )
    })
    .catch(err => {
      log.error(
        `[db] unable to subscribe <user-topic>: <${user}, ${topic}>`,
        err
      )
      return false
    })
}

/**
 * @param {string} user
 * @param {string} topic
 * @return {Promise<boolean>}
 */
const cancelSubscription = async (user, topic) => {
  log.debug(`[db] cancelling subscription <user-topic>: <${user}-${topic}>`)
  return Users.findOne({
    where: { user },
    include: ['subscriptions']
  })
    .then(userInstance => {
      if (!userInstance) {
        log.debug(`[db] user "${user}" not found`)
        return false
      }
      return ensureTopic(topic).then(topicInstance =>
        // @ts-ignore
        userInstance.removeSubscription(topicInstance.id)
      )
    })
    .catch(err => {
      log.error(`[db] unable to remove subscriptions for user "${user}"`, err)
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
      return topicInstance.subscribers.map(userInstance => userInstance.user)
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
      log.error('[db] unable to list Topics', err)
      return []
    })
}

/**
 * @return {Promise<string[]>}
 */
const listUsers = async () => {
  return Users.findAll({})
    .then(users => {
      log.debug(`[db] recovered ${users.length} users`)
      // @ts-ignore
      return users.map(userInstance => userInstance.user)
    })
    .catch(err => {
      log.error('[db] unable to list Users', err)
      return []
    })
}

/**
 * @param {string} user
 * @return {Promise<boolean>}
 */
const resetSubscriptions = async user => {
  log.debug(`[db] removing every subscription for user "${user}"`)
  return Users.findOne({ where: { user }, include: ['subscriptions'] })
    .then(userInstance => {
      // FIXME check this condition
      if (!userInstance) {
        log.debug(`[db] user "${user}" not found`)
        return false
      }
      // @ts-ignore
      return userInstance.setSubscriptions([]).then(() => {
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
  removeTopic,
  subscribe,
  cancelSubscription,
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
