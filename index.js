const Logger = require('bunyan')
const { name, version } = require('./package.json')
const server = require('./src/server')

const appInfo = `${name}@${version}`
const log = new Logger({
  name: appInfo
})

log.info('[STARTUP]', appInfo)

server.start({
  appInfo,
  log,
  onMessage: () => {
    log.info('TODO onMessage')
  },
  onNotify: () => {
    log.info('TODO onNotify')
  }
})
