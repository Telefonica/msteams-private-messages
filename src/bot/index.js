const {
  ActivityHandler,
  teamsGetTeamId,
  teamsGetChannelId
} = require('botbuilder')
const { prepareCards } = require('./cards')
const { extractInfoFromContext } = require('./context-helper')
const { readConfig } = require('../config')
const { log } = require('../log')

/**
 * @param {Types.Storage} storage
 */
const createBot = storage => {
  const bot = new ActivityHandler()
  const config = readConfig()
  const cards = prepareCards(config)

  /**
   * @param {string} user
   * @param {string} topic
   * @param {Types.Context} context
   */
  const toggleSubscription = async (user, topic, context) => {
    const subscribedTopics = await storage.getSubscribedTopics(user)
    if (subscribedTopics.includes(topic)) {
      await context.sendActivity(`Cancelling subscription from ${topic}...`)
      return storage.cancelSubscription(user, topic)
    } else {
      await context.sendActivity(`Subscribing to ${topic}...`)
      return storage.subscribe(user, topic)
    }
  }

  /**
   * @param {string[]} topics
   * @param {string} user
   */
  const getSubscriptionStatus = async (topics, user) => {
    const subscribedTopics = await storage.getSubscribedTopics(user)
    return topics.map(topic => {
      const subscribed = subscribedTopics.includes(topic)
      return { topic, subscribed }
    })
  }

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
    let {
      user,
      conversation,
      selectedTopics,
      text
    } = await extractInfoFromContext(context)
    /* perf: call only db if needed */
    await storage.saveConversation(user, conversation)

    const { check, list, reset } = cards.registeredKeywords()
    const topics = await storage.listTopics()

    if (selectedTopics) {
      /* perf: call only db if needed */
      const subscriptionTasks = selectedTopics.subscribeTo.map(topic => () =>
        storage.subscribe(user, topic)
      )
      /* perf: call only db if needed */
      const unsubscribeTasks = selectedTopics.unsubscribeFrom.map(topic => () =>
        storage.cancelSubscription(user, topic)
      )
      const tasks = subscriptionTasks.concat(unsubscribeTasks)
      await Promise.all(tasks.map(t => t()))
      text = check /* emulate the user did type 'check' */
    }

    if (text === check) {
      const subscriptionStatus = await getSubscriptionStatus(topics, user)
      const card = cards.topicsCard(
        'Currently subscribed to:',
        subscriptionStatus.filter(item => item.subscribed)
      )
      await context.sendActivity(card)
    } else if (text === list) {
      const subscriptionStatus = await getSubscriptionStatus(topics, user)
      const card = cards.topicsCard('Available Topics', subscriptionStatus)
      await context.sendActivity(card)
    } else if (text === reset) {
      await storage.resetSubscriptions(user)
      const card = cards.topicsCard(null, [])
      await context.sendActivity(card)
    } else if (topics.includes(text)) {
      await toggleSubscription(user, text, context)
      /* perf: double db call (toggleSubscription already reads db...) */
      const subscriptionStatus = await getSubscriptionStatus(topics, user)
      const card = cards.topicsCard(
        'Currently subscribed to:',
        subscriptionStatus.filter(item => item.subscribed)
      )
      await context.sendActivity(card)
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
