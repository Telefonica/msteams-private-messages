const { ActivityHandler } = require('botbuilder')
const { prepareCards } = require('./cards')
const { readYaml } = require('./yaml')
const { log } = require('./log')

/**
 * @param {Types.Storage} storage
 */
const createBot = storage => {
  const bot = new ActivityHandler()
  const config = readYaml('bot')
  const cards = prepareCards({ config })
  log.info('[STARTUP]', 'bot.yaml config read')

  /**
   * A party (including the bot) joins or leaves a conversation
   */
  bot.onConversationUpdate(async (context, next) => {
    storage.add(context.activity)
    await next()
  })

  /**
   * Members joined the conversation (including the bot)
   * @note As observed, seems `onConversationUpdate()` is called first with the same info.
   */
  bot.onMembersAdded(async (context, next) => {
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
    storage.add(context.activity)
    const username = context.activity.from.name
    const text = context.activity.text

    const { check, reset, subscriptions } = cards.registeredKeywords()
    if (text === check) {
      const info = storage.readUser(username)
      await context.sendActivity(JSON.stringify(info))
    } else if (text === reset) {
      // TODO
      const info = storage.readUser(username)
      await context.sendActivity(JSON.stringify(info))
    } else if (subscriptions.indexOf(text) > -1) {
      storage.subscribe(context.activity, text)
      const info = storage.readUser(username)
      await context.sendActivity(JSON.stringify(info))
    } else {
      await context.sendActivities([
        cards.unknownCard(),
        cards.menuCard()
      ])
    }
    await next()
  })

  log.info('[STARTUP] bot ready')

  return bot
}

module.exports = { createBot }
