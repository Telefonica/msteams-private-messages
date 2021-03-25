const {
  ActivityHandler,
  TeamsInfo,
  teamsGetTeamId,
  teamsGetChannelId,
  TurnContext
} = require('botbuilder')
const { prepareCards } = require('./cards')
const { readConfig } = require('./config')
const { sanitizeStr } = require('./sanitizers')
const { log } = require('./log')

const USE_EMAIL_AS_KEY = true // FIXME read from .env

/**
 * @param {Types.Context} context
 */
const extractInfoFromContext = async context => {
  const conversation = TurnContext.getConversationReference(context.activity)
  log.debug('[bot] conversation: ', conversation)
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
  return { conversation, user: sanitizeStr(userKey) }
}

/**
 * @param {Types.Storage} storage
 */
const createBot = storage => {
  const bot = new ActivityHandler()
  const config = readConfig()
  const cards = prepareCards(config)

  /**
   * A party (including the bot) joins or leaves a conversation
   */
  bot.onConversationUpdate(async (context, next) => {
    log.debug('[bot] onConversationUpdate')
    /* perf: check if needed to save on db */
    const { user, conversation } = await extractInfoFromContext(context)
    await storage.saveConversation(user, conversation)
    await next()
  })

  /**
   * Members joined the conversation (including the bot)
   * @note As observed, seems `onConversationUpdate()` is called first with the same info.
   */
  bot.onMembersAdded(async (context, next) => {
    log.debug('[bot] onMembersAdded')
    /* perf: check if needed to do this loop */
    const membersAdded = context.activity.membersAdded
    for (let cnt = 0; cnt < membersAdded.length; cnt++) {
      if (membersAdded[cnt].id !== context.activity.recipient.id) {
        await context.sendActivities([cards.welcomeCard(), cards.menuCard()])
      }
    }
    await next()
  })

  /**
   * Main handler: Message activity received
   */
  bot.onMessage(async (context, next) => {
    log.debug('[bot] onMessage')
    /* perf: call only db if needed */
    const { user, conversation } = await extractInfoFromContext(context)
    await storage.saveConversation(user, conversation)

    const { check, reset, list } = cards.registeredKeywords()
    const topics = await storage.listTopics()
    const text = context.activity.text

    if (text === check) {
      const info = await storage.getSubscribedTopics(user)
      // TODO: cool card instead
      await context.sendActivity(
        `subscribed to ${info.length} topics (${info.toString()})`
      )
    } else if (text === list) {
      // TODO: cool card instead
      await context.sendActivity(cards.topicsCard(topics))
    } else if (text === reset) {
      await storage.resetSubscriptions(user)
      const info = await storage.getSubscribedTopics(user)
      // TODO: cool card instead
      await context.sendActivity(
        `subscribed to ${info.length} topics (${info.toString()})`
      )
    } else if (topics.indexOf(text) > -1) {
      await storage.subscribe(user, text)
      const info = await storage.getSubscribedTopics(user)
      // TODO: cool card instead
      await context.sendActivity(
        `subscribed to ${info.length} topics (${info.toString()})`
      )
    } else if (text === 'DEBUG') {
      const teamId = await teamsGetTeamId(context.activity)
      log.info('teamId: %s', teamId)
      const channelId = await teamsGetChannelId(context.activity)
      log.info('channelId: %s', channelId)
    } else {
      await context.sendActivities([cards.unknownCard(), cards.menuCard()])
    }
    await next()
  })

  log.info('[STARTUP] bot ready')

  return bot
}

module.exports = { createBot }
