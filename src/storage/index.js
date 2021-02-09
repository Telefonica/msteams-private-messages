// @ts-nocheck
const { log } = require('../log')
const { memoryStorage } = require('./memory')
const { mysqlStorage } = require('./mysql')

/** @return {Types.Storage} */
const createStorage = () => {
  const selectedStorage =
    {
      memory: memoryStorage,
      mysql: mysqlStorage
    }[process.env.STORAGE] || memoryStorage
  log.info('[STARTUP]', `storage selected: ${process.env.STORAGE || 'memory'}`)
  return selectedStorage
}

module.exports = { createStorage }
