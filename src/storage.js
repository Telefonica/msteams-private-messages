const { TurnContext } = require('botbuilder')
const { log } = require('./log')

/* memory object: playground */
const db = {
  conversations: {},
  users: {},
  subscriptions: {}
}

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
          db.subscriptions[username] = []
        }
        db.subscriptions[username].push(topic)
      }
    },
    readUser: username => {
      log.debug('[db] reading info for user "%s"', username)
      const conversationId = db.users[username]
      return {
        conversationId,
        conversation: db.conversations[conversationId],
        subscribedTo: db.subscriptions[username]
      }
    }
  }
}

module.exports = { createStorage }
