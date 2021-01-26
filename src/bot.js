const { ActivityHandler } = require('botbuilder')

const createBot = (conversationReferences, log) => {
  const bot = new ActivityHandler()

  /**
   * A party (including the bot) joins or leaves a conversation
   */
  bot.onConversationUpdate(async (context, next) => {
    await context.sendTraceActivity('onConversationUpdate', context.activity)
    conversationReferences.add(context.activity)
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
        const welcomeMessage =
          'Welcome to the Proactive Bot sample.  Navigate to http://localhost:3978/api/notify to proactively message everyone who has previously messaged this bot.'
        await context.sendActivity(welcomeMessage)
      }
    }
    await next()
  })

  /**
   * Main handler: Message activity received
   */
  bot.onMessage(async (context, next) => {
    conversationReferences.add(context.activity)

    // Echo back what the user said
    await context.sendActivity(`You sent '${context.activity.text}'`)
    await next()
  })

  log.info('[STARTUP] bot created and configured')
  return bot
}

module.exports = { createBot }
