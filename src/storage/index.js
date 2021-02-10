const { log } = require('../log')
const memoryStorage = require('./memory')
const mysqlStorage = require('./mysql')

/**
 * @return {Promise<Types.Storage>}
 */
const createStorage = async () => {
  const selectedStorage =
    // @ts-ignore
    {
      memory: memoryStorage,
      mysql: mysqlStorage
    }[process.env.STORAGE] || memoryStorage
  await selectedStorage.tryConnection()
  log.info('[STARTUP]', `storage selected: ${process.env.STORAGE || 'memory'}`)
  return selectedStorage.storage
}

module.exports = { createStorage }
