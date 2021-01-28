const { TurnContext } = require('botbuilder')
const { log } = require('./log')

/* memory object: playground */
const db = {
  /** @type {{[index:string]: Partial<Types.ConversationReference>}} */
  conversations: {},

  /** @type {{[index:string]: string}} */
  users: {},

  /** @type {{[index:string]: Set<String>}} */
  subscriptions: {}
}

/**
 * @return {Types.Storage}
 */
const createStorage = () => {
  return {
    /**
     * @param {Types.Activity} activity
     */
    add: activity => {
      const ref = TurnContext.getConversationReference(activity)
      const conversationId = ref.conversation.id
      log.debug('[db] updating conversation #%s', conversationId)
      db.conversations[conversationId] = ref
      if (activity.from.role === 'user') {
        const username = activity.from.name
        log.debug('[db] updating user "%s"', username)
        db.users[username] = conversationId
      }
    },
    /**
     * @param {Types.Activity} activity
     * @param {string} topic
     */
    subscribe: (activity, topic) => {
      if (activity.from.role === 'user') {
        const username = activity.from.name
        log.debug('[db] updating <user-topic> pair: <%s, %s>', username, topic)
        if (!db.subscriptions[username]) {
          db.subscriptions[username] = new Set()
        }
        db.subscriptions[username].add(topic)
      }
    },
    getConversation: username => {
      log.debug('[db] reading conversation for user "%s"', username)
      const conversationId = db.users[username]
      if (!conversationId) {
        return null
      }
      return db.conversations[conversationId]
    },
    getSubscriptions: username => {
      log.debug('[db] reading subscriptions for user "%s"', username)
      const subscriptions = db.subscriptions[username] || new Set()
      return Array.from(subscriptions)
    },
    resetSubscriptions: username => {
      log.debug('[db] reading subscriptions for user "%s"', username)
      db.subscriptions[username] = new Set()
    }
  }
}

module.exports = { createStorage }
