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
 * @param {string} topic
 * @return {Promise<import('sequelize').Model | null>}
 */
const ensureTopic = async topic => {
  log.debug(`[db] ensuring topic: "${topic}"`)
  try {
    const [topicInstance, created] = await Topics.findOrCreate({
      where: { name: topic }
    })
    if (created) {
      log.debug(`[db] registered new topic "${topic}"`)
    }
    return topicInstance
  } catch (err) {
    log.error(`[db] unable to create topic "${topic}"`, err)
    return null
  }
}

/**
 * @param {string} user
 * @return {Promise<{userInstance: any, topics: string[]}|null>}
 */
const getSimplifiedUserInfo = async user => {
  log.debug(`[db] reading subscriptions for user "${user}"`)
  try {
    const userInstance = await Users.findOne({
      where: { user },
      include: ['subscriptions']
    })
    return userInstance
      ? {
          userInstance,
          // @ts-ignore
          topics: userInstance.subscriptions.map(topic => topic.name)
        }
      : null
  } catch (err) {
    log.error(`[db] unable to read subscriptions for user "${user}"`, err)
    return null
  }
}

/** @type {Types.Storage} */
const storage = {
  saveConversation: async (user, conversationRef) => {
    const conversationKey = conversationRef.conversation.id
    log.debug(
      `[db] updating conversation #${conversationKey} (user: "${user}")`
    )
    try {
      const [userInstance, created] = await Users.findOrCreate({
        where: { user },
        defaults: {
          user,
          conversationKey,
          conversationRef
        }
      })
      if (created) {
        log.debug(`[db] created new user: "${user}"`)
        // @ts-ignore
      } else if (userInstance.conversationKey !== conversationKey) {
        log.warn(`[db] need to update conversationRef for user "${user}"`)
        // @ts-ignore
        userInstance.conversationKey = conversationKey
        // @ts-ignore
        userInstance.conversationRef = conversationRef
        await userInstance.save()
      }
      return true
    } catch (err) {
      log.error(`[db] unable to create user "${user}`, err)
      return false
    }
  },

  getConversation: async user => {
    log.debug(`[db] reading conversation for user "${user}"`)
    try {
      const userInstance = await Users.findOne({ where: { user } })
      log.debug(`[db] recovered conversation for user "${user}"`)
      // @ts-ignore
      return userInstance.conversationRef
    } catch (err) {
      log.error(`[db] unable to find User "${user}"`, err)
      return null
    }
  },

  registerTopic: topic => ensureTopic(topic).then(instance => !!instance),

  removeTopic: async topic => {
    log.debug(`[db] removing topic: "${topic}"`)
    try {
      const topicInstance = await Topics.findOne({
        where: { name: topic },
        include: 'subscribers'
      })
      if (!topicInstance) {
        log.warn(`[db] "${topic}" can't be removed, does not exist`)
        return true
      }
      // @ts-ignore
      await topicInstance.setSubscribers([])
      const removedRows = await Topics.destroy({ where: { name: topic } })
      if (removedRows === 1) {
        log.debug(`[db] removed topic "${topic}"`)
      } else {
        log.warn(`[db] unexpected affected rows removing topic "${topic}"`)
      }
      return true
    } catch (err) {
      log.error(`[db] unable to remove topic "${topic}"`, err)
      return false
    }
  },

  subscribe: async (user, topic) => {
    log.debug(`[db] subscribing <user-topic>: <${user}, ${topic}>`)
    try {
      const userInfo = await getSimplifiedUserInfo(user)
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
    } catch (err) {
      log.error(
        `[db] unable to subscribe <user-topic>: <${user}, ${topic}>`,
        err
      )
      return false
    }
  },

  cancelSubscription: async (user, topic) => {
    log.debug(`[db] cancelling subscription <user-topic>: <${user}-${topic}>`)
    try {
      const userInstance = await Users.findOne({
        where: { user },
        include: ['subscriptions']
      })
      if (!userInstance) {
        log.debug(`[db] user "${user}" not found`)
        return false
      }
      const topicInstance = await Topics.findOne({ where: { name: topic } })
      if (!topicInstance) {
        log.debug(`[db] topic "${topic}" not found`)
        return false
      }
      // @ts-ignore
      await userInstance.removeSubscription(topicInstance.id)
      return true
    } catch (err) {
      log.error(`[db] unable to remove subscriptions for user "${user}"`, err)
      return false
    }
  },

  getSubscribedTopics: user =>
    getSimplifiedUserInfo(user)
      .then(({ topics }) => topics)
      .catch(() => null),

  getSubscribers: async topic => {
    log.debug(`[db] reading subscribers of "${topic}"`)
    try {
      const topicInstance = await Topics.findOne({
        where: { name: topic },
        include: 'subscribers'
      })
      if (!topicInstance) {
        log.debug(`[db] topic "${topic}" not found`)
        return null
      }
      // @ts-ignore
      return topicInstance.subscribers.map(userInstance => userInstance.user)
    } catch (err) {
      log.error(`[db] unable to read subscribers of "${topic}"`, err)
      return null
    }
  },

  listUsers: async () => {
    try {
      const users = await Users.findAll({ order: [['user', 'ASC']] })
      log.debug(`[db] recovered ${users.length} users`)
      // @ts-ignore
      return users.map(userInstance => userInstance.user)
    } catch (err) {
      log.error('[db] unable to list Users', err)
      return null
    }
  },

  listTopics: async () => {
    try {
      const topics = await Topics.findAll({ order: [['name', 'ASC']] })
      log.debug(`[db] recovered ${topics.length} topics`)
      // @ts-ignore
      return topics.map(topic => topic.name)
    } catch (err) {
      log.error('[db] unable to list Topics', err)
      return null
    }
  },

  resetSubscriptions: async user => {
    log.debug(`[db] removing every subscription for user "${user}"`)
    try {
      const userInstance = await Users.findOne({
        where: { user },
        include: ['subscriptions']
      })
      if (!userInstance) {
        log.debug(`[db] user "${user}" not found`)
        return false
      }
      // @ts-ignore
      await userInstance.setSubscriptions([])
      log.debug(`[db] removed every subscription for user "${user}"`)
      return true
    } catch (err) {
      log.error(`[db] unable to remove subscriptions for user "${user}"`, err)
      return false
    }
  },

  removeSubscribers: async topic => {
    log.debug(`[db] removing every subscriber to topic "${topic}"`)
    try {
      const topicInstance = await Topics.findOne({
        where: { name: topic },
        include: 'subscribers'
      })
      if (!topicInstance) {
        log.debug(`[db] topic "${topic}" not found`)
        return false
      }
      // @ts-ignore
      await topicInstance.setSubscribers([])
      log.debug(`[db] removed every subscriber to topic "${topic}"`)
      return true
    } catch (err) {
      log.error(`[db] unable to remove subscribers to "${topic}"`, err)
      return false
    }
  }
}

module.exports = {
  tryConnection,
  storage
}
