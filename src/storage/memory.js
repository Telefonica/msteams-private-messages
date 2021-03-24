const { log } = require('../log')

/* memory object */
const db = {
  /** @type {{[conversationId:string]: Partial<Types.ConversationReference>}} */
  conversations: {},

  /** @type {{[user:string]: string}} */
  users: {},

  /** @type {{[topic:string]: string[]}} */
  topics: {}
}

/**
 * @type {Types.Storage}
 */
const storage = {
  saveConversation: async (user, conversationRef) => {
    if (!conversationRef.conversation) {
      return false
    }
    const conversationId = conversationRef.conversation.id
    log.debug('[db] updating conversation #%s', conversationId)
    db.conversations[conversationId] = conversationRef
    log.debug('[db] updating user "%s"', user)
    db.users[user] = conversationId
    return true
  },

  getConversation: async user => {
    log.debug('[db] reading conversation for user "%s"', user)
    const conversationId = db.users[user]
    if (!conversationId) {
      return null
    }
    return db.conversations[conversationId]
  },

  registerTopic: async topic => {
    log.debug('[db] registering new topic: "%s"', topic)
    if (!db.topics[topic]) {
      db.topics[topic] = []
    }
    return true
  },

  removeTopic: async topic => {
    log.debug('[db] removing topic: "%s"', topic)
    return delete db.topics[topic]
  },

  subscribe: async (user, topic) => {
    log.debug('[db] updating <user-topic> pair: <%s, %s>', user, topic)
    if (!db.topics[topic]) {
      db.topics[topic] = []
    }
    if (db.topics[topic].indexOf(user) < 0) {
      db.topics[topic].push(user)
    }
    return true
  },

  cancelSubscription: async (user, topic) => {
    log.debug('[db] removing <user-topic> pair: <%s, %s>', user, topic)
    const topics = db.topics[topic]
    if (!topics) {
      return false
    }
    const topicIndex = topics.indexOf(user)
    if (topicIndex < 0) {
      return true // user not subscribed to topic at all
    }
    topics.splice(topicIndex, 1)
    return true
  },

  getSubscribedTopics: async user => {
    log.debug('[db] reading subscriptions for user "%s"', user)
    const subscriptions = []
    for (const topic in db.topics) {
      if (db.topics[topic].indexOf(user) > -1) {
        subscriptions.push(topic)
      }
    }
    return subscriptions
  },

  getSubscribers: async topic => {
    return db.topics[topic] || []
  },

  listUsers: async () => Object.keys(db.users),

  listTopics: async () => Object.keys(db.topics),

  resetSubscriptions: async user => {
    log.debug('[db] removing every subscription for user "%s"', user)
    for (const topic in db.topics) {
      const index = db.topics[topic].indexOf(user)
      if (index > -1) {
        db.topics[topic].splice(index, 1)
      }
    }
    return true
  },

  removeSubscribers: async topic => {
    log.debug('[db] removing every subscriber to topic "%s"', topic)
    db.topics[topic] = []
    return true
  }
}

module.exports = {
  tryConnection: () => Promise.resolve(true),
  storage
}
