const dotenv = require('dotenv')
const path = require('path')
const Logger = require('bunyan')

const { name, version } = require('./package.json')
const { createBotAdapter } = require('./src/bot-adapter')
const { createBot } = require('./src/bot')
const { createServer } = require('./src/server')
const { createStorage } = require('./src/storage')

const appInfo = `${name}@${version}`
const log = new Logger({
  name: appInfo
})
log.info('[STARTUP]', appInfo)

/* load .env file before instanciating dependent objects (do NOT move) */
dotenv.config({ path: path.join(__dirname, '.env') })
log.info('[STARTUP] .env file read')

const adapter = createBotAdapter(log)
const storage = createStorage(log)
const bot = createBot(storage, log)

createServer({
  log,
  appInfo,
  onMessage: async (req, res) => {
    adapter.processActivity(req, res, async turnContext => {
      // route to main dialog.
      await bot.run(turnContext)
    })
  },
  onNotify: async input => {
    log.info('TODO onNotify')
    return {}
  }
})
