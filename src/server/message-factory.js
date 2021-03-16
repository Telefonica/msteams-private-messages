const { MessageFactory, CardFactory } = require('botbuilder')
const { TextEncoder } = require('util')

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

/** @param {any} message */
const isAdaptiveCard = message => message.type === 'AdaptiveCard'

/** @param {any} message */
const isRichCard = message => message.type === 'message'

/**
 * @param {Types.Context} context
 * @param {string | Partial<Types.Activity>} message
 * @param {Types.NotifyOpts} opts
 */
const defineMessageAsActivity = (context, message, { includeMention }) => {
  if (typeof message === 'string') {
    return includeMention ? appendMentionToMsg(context, message) : message
  }
  /* card */
  if (isAdaptiveCard(message)) {
    return MessageFactory.attachment(CardFactory.adaptiveCard(message))
  }
  if (isRichCard(message)) {
    return message
  }
  throw new Error('UnknownMessageFormat')
}

module.exports = { defineMessageAsActivity }
