const { storage } = require('./memory')
const conversationRef = require('../fixtures/conversation-reference.json')

describe('memory.storage', () => {
  beforeAll(async () => {
    /*
     * initial memory state
     * jane.doe@megacoorp.com -- subscribed to --> [ banana, orange ]
     *
     * -----------------------------------------------------------
     * FIXME: these tests aren't idempotent,
     * while this isn't the best, isn't a big deal neither.
     * Just have in mind that test order IS relevant.
     * ------------------------------------------------------------
     */
    await storage.saveConversation('jane.doe@megacoorp.com', conversationRef)
    await storage.subscribe('jane.doe@megacoorp.com', 'banana')
    await storage.subscribe('jane.doe@megacoorp.com', 'orange')
  })

  describe('getConversation()', () => {
    it('recovers the conversation', async () => {
      const got = await storage.getConversation('jane.doe@megacoorp.com')
      expect(got).toEqual(conversationRef)
    })
  })

  describe('saveConversation()', () => {
    it('overrides conversation reference', async () => {
      const newConversationRef = { ...conversationRef, activityId: 'NEW VALUE' }
      await storage.saveConversation(
        'jane.doe@megacoorp.com',
        newConversationRef
      )
      const got = await storage.getConversation('jane.doe@megacoorp.com')
      expect(got).toEqual(newConversationRef)
    })
  })

  describe('listUsers()', () => {
    it('returns users as plain strings', async () => {
      await storage.saveConversation(
        'jhon.smith@contractor.com',
        conversationRef
      )
      const users = await storage.listUsers()
      expect(users).toEqual([
        'jane.doe@megacoorp.com',
        'jhon.smith@contractor.com'
      ])
    })

    it('mangages duplicated entries', async () => {
      await Promise.all([
        storage.saveConversation('jane.doe@megacoorp.com', conversationRef),
        storage.saveConversation('jane.doe@megacoorp.com', conversationRef),
        storage.saveConversation('jhon.smith@contractor.com', conversationRef),
        storage.saveConversation('jane.doe@megacoorp.com', conversationRef)
      ])
      const users = await storage.listUsers()
      expect(users).toEqual([
        'jane.doe@megacoorp.com',
        'jhon.smith@contractor.com'
      ])
    })
  })

  describe('getSubscribedTopics()', () => {
    it('returns topics as plain strings', async () => {
      const got = await storage.getSubscribedTopics('jane.doe@megacoorp.com')
      expect(got).toEqual(['banana', 'orange'])
    })

    it('manages duplicated entries', async () => {
      await Promise.all([
        storage.subscribe('jane.doe@megacoorp.com', 'banana'),
        storage.subscribe('jane.doe@megacoorp.com', 'banana'),
        storage.subscribe('jane.doe@megacoorp.com', 'orange'),
        storage.subscribe('jane.doe@megacoorp.com', 'banana')
      ])
      const got = await storage.getSubscribedTopics('jane.doe@megacoorp.com')
      expect(got).toEqual(['banana', 'orange'])
    })
  })

  describe('listTopics()', () => {
    it('considers the happy path', async () => {
      const got = await storage.listTopics()
      expect(got).toEqual(['banana', 'orange'])
    })

    it('manages duplicated entries', async () => {
      await Promise.all([
        storage.registerTopic('banana'),
        storage.registerTopic('banana'),
        storage.registerTopic('orange'),
        storage.registerTopic('banana')
      ])
      const got = await storage.listTopics()
      expect(got).toEqual(['banana', 'orange'])
    })
  })

  describe('resetSubscriptions()', () => {
    it('considers the happy path', async () => {
      await storage.resetSubscriptions('jane.doe@megacoorp.com')
      const got = await storage.getSubscribedTopics('jane.doe@megacoorp.com')
      expect(got).toEqual([])
    })
  })
})
