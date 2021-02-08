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
 * @param {string} user
 * @param {Partial<Types.ConversationReference>} conversationRef
 */
const saveConversation = async (user, conversationRef) => {
  if (!conversationRef.conversation) {
    return false
  }
  const conversationId = conversationRef.conversation.id
  log.debug('[db] updating conversation #%s', conversationId)
  db.conversations[conversationId] = conversationRef
  log.debug('[db] updating user "%s"', user)
  db.users[user] = conversationId
  return true
}

/**
 * @param {string} user
 */
const getConversation = async user => {
  log.debug('[db] reading conversation for user "%s"', user)
  const conversationId = db.users[user]
  if (!conversationId) {
    return null
  }
  return db.conversations[conversationId]
}

/**
 * @param {string} user
 * @param {string} topic
 */
const subscribe = async (user, topic) => {
  log.debug('[db] updating <user-topic> pair: <%s, %s>', user, topic)
  if (!db.topics[topic]) {
    db.topics[topic] = []
  }
  if (db.topics[topic].indexOf(user) < 0) {
    db.topics[topic].push(user)
  }
  return true
}

/**
 * @param {string} user
 */
const getSubscribedTopics = async user => {
  log.debug('[db] reading subscriptions for user "%s"', user)
  const subscriptions = []
  for (const topic in db.topics) {
    if (db.topics[topic].indexOf(user) > -1) {
      subscriptions.push(topic)
    }
  }
  return subscriptions
}

/**
 * @param {string} topic
 */
const getSubscribers = async topic => {
  return db.topics[topic] || []
}

const listTopics = async () => Object.keys(db.topics)

const listUsers = async () => Object.keys(db.users)

/**
 * @param {string} user
 */
const resetSubscriptions = async user => {
  log.debug('[db] removing every subscription for user "%s"', user)
  for (const topic in db.topics) {
    const index = db.topics[topic].indexOf(user)
    if (index > -1) {
      db.topics[topic].splice(index, 1)
    }
  }
  return true
}

/**
 *
 * @param {string} topic
 */
const removeSubscribers = async topic => {
  log.debug('[db] removing every subscriber to topic "%s"', topic)
  db.topics[topic] = []
  return true
}

/**
 * @type {Types.Storage}
 */
const memoryStorage = {
  saveConversation,
  getConversation,
  subscribe,
  getSubscribedTopics,
  getSubscribers,
  listUsers,
  listTopics,
  resetSubscriptions,
  removeSubscribers
}

module.exports = { memoryStorage }
