const { MessageFactory } = require('botbuilder')
const { TextEncoder } = require('util')
const { log } = require('../log')
const { simpleCard } = require('../cards')

const encoder = new TextEncoder()

/**
 * `"hi there"` => `"hi there @jane"`
 *
 * @param {Types.Context} context
 * @param {string} message
 */
const appendMentionToMsg = (context, message) => {
  const encodedUserName = encoder.encode(context.activity.from.name)
  const mention = {
    type: 'mention',
    mentioned: context.activity.from,
    text: `<at>${encodedUserName}</at>`
  }
  const topLevelMessage = MessageFactory.text(`${message} ${mention.text}`)
  topLevelMessage.entities = [mention]
  return topLevelMessage
}

/**
 * @param {import('botbuilder').BotFrameworkAdapter} adapter
 */
const createConversationHelper = adapter => {
  /**
   * @doc https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-proactive-message?view=azure-bot-service-4.0&tabs=javascript
   *
   * @param {Partial<Types.ConversationReference>} conversationRef
   * @param {string | Types.ICard} message
   * @param {boolean} includeMention
   */
  const sendMessage = async (
    conversationRef,
    message,
    includeMention = false
  ) => {
    await adapter.continueConversation(conversationRef, async context => {
      const conversationId = conversationRef.conversation.id
      log.debug('[adapter] conversation #%s restored', conversationId)
      let messageAsActivity
      if (typeof message === 'string') {
        messageAsActivity = includeMention
          ? appendMentionToMsg(context, message)
          : message
      } else {
        // TODO: include the option of include mention to card messages (use 'text' property)
        messageAsActivity = simpleCard(message)
      }
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
