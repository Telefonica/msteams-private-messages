const memoryStorage = require('./memory')
const mysqlStorage = require('./mysql')
const { createStorage } = require('./index')

jest.mock('./memory')
jest.mock('./mysql')
jest.mock('../../db/sequelize/models') //

describe('createStorage()', () => {
  it('returns memory storage by default', async () => {
    const storage = await createStorage({})
    expect(storage).toBe(memoryStorage.storage)
  })

  it('returns memory storage if unknown storage selected', async () => {
    const storage = await createStorage({ selectedStorage: 'unknown' })
    expect(storage).toBe(memoryStorage.storage)
  })

  describe('depending on "selectedStorage" opt...', () => {
    it('returns memory storage', async () => {
      const storage = await createStorage({ selectedStorage: 'memory' })
      expect(storage).toBe(memoryStorage.storage)
    })

    it('returns mysql storage', async () => {
      const storage = await createStorage({ selectedStorage: 'mysql' })
      expect(storage).toBe(mysqlStorage.storage)
    })
  })
})
