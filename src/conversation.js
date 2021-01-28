const { log } = require('./log')

/**
 * @param {import('botbuilder').BotFrameworkAdapter} adapter
 */
const createConversation = adapter => {
  /**
   * @param {Partial<Types.ConversationReference>} conversationRef
   * @param {string} message
   * @doc https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-proactive-message?view=azure-bot-service-4.0&tabs=javascript
   */
  const sendMessage = async (conversationRef, message) => {
    await adapter.continueConversation(conversationRef, async context => {
      const conversationId = conversationRef.conversation.id
      log.debug('conversation #%s restored', conversationId)
      try {
        await context.sendActivity(message)
      } catch (err) {
        log.error(err, 'sending activity to conversation #%s', conversationId)
      }
    })
  }

  return { sendMessage }
}

module.exports = { createConversation }
