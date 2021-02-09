const { Sequelize } = require('sequelize')
const { log } = require('../log')

const connectToMySQL = async () => {
  /**
   * @param {string} user
   * @param {Partial<Types.ConversationReference>} conversationRef
   */
  const saveConversation = async (user, conversationRef) => {
    const conversationId = conversationRef.conversation.id
    log.debug('[db] updating conversation #%s', conversationId)
    // TODO
    return true
  }

  /**
   * @param {string} user
   * @return {Promise<Partial<Types.ConversationReference> | null>}
   */
  const getConversation = async user => {
    log.debug('[db] reading conversation for user "%s"', user)
    // TODO
    return null
  }

  /**
   * @param {string} user
   * @param {string} topic
   */
  const subscribe = async (user, topic) => {
    log.debug('[db] updating <user-topic> pair: <%s, %s>', user, topic)
    // TODO
    return true
  }

  /**
   * @param {string} user
   * @return {Promise<string[]>}
   */
  const getSubscribedTopics = async user => {
    log.debug('[db] reading subscriptions for user "%s"', user)
    // TODO
    return []
  }

  /**
   * @param {string} topic
   * @return {Promise<string[]>}
   */
  const getSubscribers = async topic => {
    // TODO
    return []
  }

  /**
   * @return {Promise<string[]>}
   */
  const listTopics = async () => {
    // TODO
    return []
  }

  /**
   * @return {Promise<string[]>}
   */
  const listUsers = async () => {
    return []
  }

  /**
   * @param {string} user
   */
  const resetSubscriptions = async user => {
    log.debug('[db] removing every subscription for user "%s"', user)
    // TODO
    return true
  }

  /**
   * @param {string} topic
   */
  const removeSubscribers = async topic => {
    log.debug('[db] removing every subscriber to topic "%s"', topic)
    // TODO
    return true
  }

  /**
   * @type {Types.Storage}
   */
  return {
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
}

module.exports = { connectToMySQL }
