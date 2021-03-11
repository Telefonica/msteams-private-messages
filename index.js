const dotenv = require('dotenv')
const path = require('path')
const globalAgent = require('global-agent')

/* load .env file before instanciating dependent objects (do NOT move) */
dotenv.config({ path: path.join(__dirname, '.env') })

/* globalAgent: HTTP/HTTPS proxy configurable using environment variables */
globalAgent.bootstrap()

const { log } = require('./src/log')
const { createBotAdapter } = require('./src/bot-adapter')
const { createBot } = require('./src/bot')
const { createStorage } = require('./src/storage')
const { createServer } = require('./src/server')

const run = async () => {
  log.info('[STARTUP]', log.fields.name)

  const adapter = createBotAdapter({
    runningLocally: process.env.LOCAL === 'true',
    microsoftAppId: process.env.MICROSOFT_APP_ID || null,
    microsoftAppPassword: process.env.MICROSOFT_APP_PASSWORD || null
  })
  const storage = await createStorage({
    selectedStorage: process.env.STORAGE || 'memory'
  })
  const bot = createBot(storage)

  createServer(adapter, storage, bot).start({
    port: parseInt(process.env.PORT) || 3978
  })
}

try {
  run()
} catch (err) {
  log.fatal(err)
}
