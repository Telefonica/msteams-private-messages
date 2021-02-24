const dotenv = require('dotenv')
const path = require('path')

/* load .env file before instanciating dependent objects (do NOT move) */
dotenv.config({ path: path.join(__dirname, '.env') })

const { log } = require('./src/log')
const { createBotAdapter } = require('./src/bot-adapter')
const { createBot } = require('./src/bot')
const { createStorage } = require('./src/storage')
const { createServer } = require('./src/server')

const run = async () => {
  log.info('[STARTUP]', log.fields.name)
  log.info('[STARTUP]', '.env file read')

  const adapter = createBotAdapter()
  const storage = await createStorage()
  const bot = createBot(storage)

  createServer(adapter, storage, bot).start()
}

try {
  run()
} catch (err) {
  log.fatal(err)
}
