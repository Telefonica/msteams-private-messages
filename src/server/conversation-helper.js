const { log } = require('../log')
const { defineMessageAsActivity } = require('./message-factory')

/**
 * @param {import('botbuilder').BotFrameworkAdapter} adapter
 */
const createConversationHelper = adapter => {
  /**
   * @doc https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-proactive-message?view=azure-bot-service-4.0&tabs=javascript
   *
   * @param {Partial<Types.ConversationReference>} conversationRef
   * @param {string | Partial<Types.Activity>} message
   * @param {Types.NotifyOpts=} opts
   */
  const sendMessage = async (
    conversationRef,
    message,
    opts = { includeMention: false }
  ) => {
    await adapter.continueConversation(conversationRef, async context => {
      const conversationId = conversationRef.conversation.id
      log.debug('[adapter] conversation #%s restored', conversationId)
      const messageAsActivity = defineMessageAsActivity(context, message, opts)
      try {
        await context.sendActivity(messageAsActivity)
      } catch (err) {
        log.error(err, 'sending activity to conversation #%s', conversationId)
      }
    })
  }

  return { sendMessage }
}

module.exports = { createConversationHelper }
