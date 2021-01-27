const Logger = require('bunyan')
const { name, version } = require('../package.json')

const log = new Logger({ name: `${name}@${version}` })

module.exports = { log }
