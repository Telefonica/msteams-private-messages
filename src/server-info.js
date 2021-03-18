const { name, version } = require('../package.json')

module.exports = {
  serverInfo: () => `${name}@${version}`
}
