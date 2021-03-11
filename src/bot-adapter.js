const { BotFrameworkAdapter } = require('botbuilder')
const { log } = require('./log')

/**
 * @param {object} param0
 * @param {boolean} param0.runningLocally
 * @param {string=} param0.microsoftAppId
 * @param {string=} param0.microsoftAppPassword
 */
const createBotAdapter = ({
  runningLocally,
  microsoftAppId,
  microsoftAppPassword
}) => {
  const adapter = new BotFrameworkAdapter({
    appId: runningLocally ? null : microsoftAppId,
    appPassword: runningLocally ? null : microsoftAppPassword
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
