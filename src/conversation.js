const { log } = require('./log')
const { simpleCard } = require('./cards')

/**
 * @param {import('botbuilder').BotFrameworkAdapter} adapter
 */
const createConversation = adapter => {
  /**
   * @param {Partial<Types.ConversationReference>} conversationRef
   * @param {string | Types.ICard} message
   * @doc https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-proactive-message?view=azure-bot-service-4.0&tabs=javascript
   */
  const sendMessage = async (conversationRef, message) => {
    await adapter.continueConversation(conversationRef, async context => {
      const conversationId = conversationRef.conversation.id
      log.debug('conversation #%s restored', conversationId)
      const messageAsActivity = typeof message === 'string' ? message : simpleCard(message)
      try {
        await context.sendActivity(messageAsActivity)
      } catch (err) {
        log.error(err, 'sending activity to conversation #%s', conversationId)
      }
    })
  }

  return { sendMessage }
}

module.exports = { createConversation }
