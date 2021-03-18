const Logger = require('bunyan')
const { serverInfo } = require('./server-info')

const log = new Logger({
  name: serverInfo(),
  // @ts-ignore
  level: process.env.LOG_LEVEL || 'info'
})

/* disable logging for testing */
if (process.env.NODE_ENV === 'test') {
  log.level(Logger.FATAL + 1)
}

module.exports = { log }
