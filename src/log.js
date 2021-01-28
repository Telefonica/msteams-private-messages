const Logger = require('bunyan')
const { name, version } = require('../package.json')

const log = new Logger({
  name: `${name}@${version}`,
  // @ts-ignore
  level: process.env.LOG_LEVEL || 'info'
})

module.exports = { log }
