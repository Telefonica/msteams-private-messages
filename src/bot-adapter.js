const { BotFrameworkAdapter } = require('botbuilder')
const { log } = require('./log')

const createBotAdapter = () => {
  const runningLocally = process.env.LOCAL === 'true' || false

  const adapter = new BotFrameworkAdapter({
    appId: runningLocally ? null : process.env.MICROSOFT_APP_ID,
    appPassword: runningLocally ? null : process.env.MICROSOFT_APP_PASSWORD
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
