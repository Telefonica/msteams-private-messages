const Logger = require('bunyan')
const { name, version } = require('../package.json')

const log = new Logger({
  name: `${name}@${version}`,
  // @ts-ignore
  level: process.env.LOG_LEVEL || 'info'
})

/* disable logging for testing */
if (process.env.NODE_ENV === 'test') {
  log.level(Logger.FATAL + 1)
}

module.exports = { log }
