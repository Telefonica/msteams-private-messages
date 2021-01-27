const { BotFrameworkAdapter } = require('botbuilder')
const { log } = require('./log')

const createBotAdapter = () => {
  const runningLocally = process.env.LOCAL || false

  const adapter = new BotFrameworkAdapter({
    appId: runningLocally ? null : process.env.MicrosoftAppId,
    appPassword: runningLocally ? null : process.env.MicrosoftAppPassword
  })

  adapter.onTurnError = async (context, error) => {
    log.error(error, '[onTurnError] unhandled erro')

    await context.sendTraceActivity(
      'OnTurnError Trace',
      `${error}`,
      'https://www.botframework.com/schemas/error',
      'TurnError'
    )

    await context.sendActivity('The bot encountered an error or bug.')
  }

  log.info(`[STARTUP] created bot adapter (runningLocally: ${runningLocally})`)
  return adapter
}

module.exports = { createBotAdapter }
