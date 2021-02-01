const { TurnContext } = require('botbuilder')
const { log } = require('./log')

/* memory object: playground */
const db = {
  /** @type {{[conversationId:string]: Partial<Types.ConversationReference>}} */
  conversations: {},

  /** @type {{[username:string]: string}} */
  users: {},

  /** @type {{[topic:string]: string[]}} */
  topics: {}
}

/**
 * @return {Types.Storage}
 */
const createStorage = () => {
  return {
    saveConversation: activity => {
      const ref = TurnContext.getConversationReference(activity)
      const conversationId = ref.conversation.id
      log.debug('[db] updating conversation #%s', conversationId)
      db.conversations[conversationId] = ref
      const username = activity.from.name
      log.debug('[db] updating user "%s"', username)
      db.users[username] = conversationId
    },

    getConversation: username => {
      log.debug('[db] reading conversation for user "%s"', username)
      const conversationId = db.users[username]
      if (!conversationId) {
        return null
      }
      return db.conversations[conversationId]
    },

    subscribe: (activity, topic) => {
      const username = activity.from.name
      log.debug('[db] updating <user-topic> pair: <%s, %s>', username, topic)
      if (!db.topics[topic]) {
        db.topics[topic] = []
      }
      if (db.topics[topic].indexOf(username) < 0) {
        db.topics[topic].push(username)
      }
    },

    getSubscribedTopics: username => {
      log.debug('[db] reading subscriptions for user "%s"', username)
      const subscriptions = []
      for (const topic in db.topics) {
        if (db.topics[topic].indexOf(username) > -1) {
          subscriptions.push(topic)
        }
      }
      return subscriptions
    },

    getSubscribers: topic => {
      return db.topics[topic] || []
    },

    resetSubscriptions: username => {
      log.debug('[db] removing every subscription for user "%s"', username)
      for (const topic in db.topics) {
        const index = db.topics[topic].indexOf(username)
        if (index > -1) {
          db.topics[topic].splice(index, 1)
        }
      }
    },

    removeSubscribers: topic => {
      log.debug('[db] removing every subscriber to topic "%s"', topic)
      db.topics[topic] = []
    }
  }
}

module.exports = { createStorage }
