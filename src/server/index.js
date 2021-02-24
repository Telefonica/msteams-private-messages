const { createHandlers } = require('./handlers')
const { createRestifyServer } = require('./restify-server')

/**
 * @param {import('botbuilder').BotFrameworkAdapter} adapter
 * @param {Types.Storage} storage
 * @param {import('botbuilder').ActivityHandler} bot
 */
const createServer = (adapter, storage, bot) => {
  const handlers = createHandlers(adapter, storage, bot)
  return createRestifyServer(handlers)
}

module.exports = { createServer }
