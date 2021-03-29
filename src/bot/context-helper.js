const { TeamsInfo, TurnContext } = require('botbuilder')
const { log } = require('../log')
const { sanitizeStr } = require('../sanitizers')

const USE_EMAIL_AS_KEY = true // FIXME read from .env

/** @param {Types.Activity} activity */
const hasSubmitData = activity =>
  activity.channelData &&
  activity.channelData.postBack &&
  activity.value &&
  activity.value.action

/** @param {Types.Activity} activity */
const hasSubmitTopicSelection = activity =>
  activity.value.action === 'topic-selection'

/** @param {Types.Activity} activity */
const topicSelection = activity => {
  /*
    {
      "action": "topic-selection",
      "orange": "true",
      "banana": "false"
    }
   */
  const rawSelection = { ...activity.value }
  delete rawSelection.action
  const subscribeTo = []
  const unsubscribeFrom = []
  for (const topicName in rawSelection) {
    if (rawSelection[topicName] === 'true') {
      subscribeTo.push(topicName)
    } else {
      unsubscribeFrom.push(topicName)
    }
  }
  return { subscribeTo, unsubscribeFrom }
}

/**
 * @param {Types.Context} context
 * @return {Promise<Types.InfoFromContext>}
 */
const extractInfoFromContext = async context => {
  const conversation = TurnContext.getConversationReference(context.activity)
  let userKey = context.activity.from.name
  if (USE_EMAIL_AS_KEY) {
    try {
      const memeberInfo = await TeamsInfo.getMember(
        context,
        context.activity.from.id
      )
      /* check if we need .email or .userPrincipalName (seems to be the same) */
      userKey = memeberInfo.email
    } catch (err) {
      // we've tried our best, lets keep the username
      log.warn(err, 'considering username (%s) instead of user.email', userKey)
    }
  }
  log.trace('[bot] activity: ', context.activity)
  let selectedTopics = null
  if (hasSubmitData(context.activity)) {
    if (hasSubmitTopicSelection(context.activity)) {
      selectedTopics = topicSelection(context.activity)
    }
  }
  const infoFromContext = {
    conversation,
    user: sanitizeStr(userKey),
    selectedTopics,
    text: context.activity.text
  }
  log.debug('[bot] info from context: ', infoFromContext)
  return infoFromContext
}

module.exports = { extractInfoFromContext }
