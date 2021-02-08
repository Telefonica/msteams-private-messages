// @ts-nocheck
const { memoryStorage } = require('./memory')

/** @return {Types.Storage} */
const createStorage = () => {
  const selection = process.env.STORAGE || 'memory'
  const selectedStorage = {
    memory: memoryStorage
    // TODO
  }[selection]
  return selectedStorage
}

module.exports = { createStorage }
