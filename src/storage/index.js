const { log } = require('../log')
const memoryStorage = require('./memory')
const mysqlStorage = require('./mysql')

/**
 * @param {object} param0
 * @param {string=} param0.selectedStorage
 * @return {Promise<Types.Storage>}
 */
const createStorage = async ({ selectedStorage }) => {
  const curatedStorage =
    ['memory', 'mysql'].indexOf(selectedStorage) > -1
      ? selectedStorage
      : 'memory'
  const storage = {
    memory: memoryStorage,
    mysql: mysqlStorage
  }[curatedStorage]
  await storage.tryConnection()
  log.info('[STARTUP]', `selected storage: ${curatedStorage}`)
  return storage.storage
}

module.exports = { createStorage }
