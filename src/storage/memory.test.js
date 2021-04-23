const { storage } = require('./memory')
const conversationRefs = require('../fixtures/conversation-reference.json')

describe('memory.storage', () => {
  beforeAll(async () => {
    /*
     * initial memory state
     *  jane.doe@megacoorp.com    -- subscribed to --> [ banana, orange ]
     *  jhon.smith@contractor.com -- subscribed to --> [ orange, apple ]
     * -----------------------------------------------------------
     * FIXME: these tests aren't idempotent,
     * while this isn't the best, isn't a big deal neither.
     * Just have in mind that test order IS relevant.
     * ------------------------------------------------------------
     */
    await storage.saveConversation('jane.doe@megacoorp.com', conversationRefs['jane.doe@megacoorp.com'])
    await storage.saveConversation('jhon.smith@contractor.com', conversationRefs['john.smith@contractor.com'])
    await storage.subscribe('jane.doe@megacoorp.com', 'banana')
    await storage.subscribe('jane.doe@megacoorp.com', 'orange')
    await storage.subscribe('jhon.smith@contractor.com', 'orange')
    await storage.subscribe('jhon.smith@contractor.com', 'apple')
  })

  describe('getConversation()', () => {
    it('recovers the conversation reference', async () => {
      const got = await storage.getConversation('jane.doe@megacoorp.com')
      expect(got).toEqual(conversationRefs['jane.doe@megacoorp.com'])
    })
  })

  describe('saveConversation()', () => {
    it('overrides existing conversation reference', async () => {
      const newConversationRef = { ...conversationRefs['jane.doe@megacoorp.com'], activityId: 'NEW VALUE' }
      await storage.saveConversation(
        'jane.doe@megacoorp.com',
        newConversationRef
      )
      const got = await storage.getConversation('jane.doe@megacoorp.com')
      expect(got).toEqual(newConversationRef)
    })
  })

  describe('listUsers()', () => {
    it('returns user keys as plain strings', async () => {
      const users = await storage.listUsers()
      expect(users).toEqual([
        'jane.doe@megacoorp.com',
        'jhon.smith@contractor.com'
      ])
    })

    it('mangages duplicated entries', async () => {
      await Promise.all([
        storage.saveConversation('jane.doe@megacoorp.com', conversationRefs['jane.doe@megacoorp.com']),
        storage.saveConversation('jane.doe@megacoorp.com', conversationRefs['jane.doe@megacoorp.com']),
        storage.saveConversation('jhon.smith@contractor.com', conversationRefs['john.smith@contractor.com']),
        storage.saveConversation('jane.doe@megacoorp.com', conversationRefs['jane.doe@megacoorp.com'])
      ])
      const users = await storage.listUsers()
      expect(users).toEqual([
        'jane.doe@megacoorp.com',
        'jhon.smith@contractor.com'
      ])
    })
  })

  describe('listTopics()', () => {
    it('returns topics names as plain strings', async () => {
      const got = await storage.listTopics()
      expect(got).toEqual(['banana', 'orange', 'apple'])
    })

    it('manages duplicated entries', async () => {
      await Promise.all([
        storage.registerTopic('banana'),
        storage.registerTopic('banana'),
        storage.registerTopic('orange'),
        storage.registerTopic('apple'),
        storage.registerTopic('banana')
      ])
      const got = await storage.listTopics()
      expect(got).toEqual(['banana', 'orange', 'apple'])
    })
  })

  describe('getSubscribedTopics()', () => {
    it('returns subscribed topic names as plain strings', async () => {
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

  describe('getSubscribers()', () => {
    it('returns subscriber users keys as plain strings', async () => {
      const subscribers = await storage.getSubscribers('orange')
      expect(subscribers).toEqual([
        'jane.doe@megacoorp.com',
        'jhon.smith@contractor.com'
      ])
    })
  })

  describe('cancelSubscription()', () => {
    it('ignores unknown topics', async () => {
      const success = await storage.cancelSubscription(
        'jane.doe@megacoorp.com',
        'pineapple'
      )
      expect(success).toEqual(false)
      const subscribedTopics = await storage.getSubscribedTopics(
        'jane.doe@megacoorp.com'
      )
      expect(subscribedTopics).toEqual(['banana', 'orange'])
    })

    it('cancels the subscription to the topic', async () => {
      const success = await storage.cancelSubscription(
        'jane.doe@megacoorp.com',
        'banana'
      )
      expect(success).toEqual(true)
      const subscribedTopics = await storage.getSubscribedTopics(
        'jane.doe@megacoorp.com'
      )
      expect(subscribedTopics).toEqual(['orange'])
    })
  })

  describe('removeTopic()', () => {
    it('cancels subscription of any user to the topic & removes it', async () => {
      await storage.removeTopic('apple')
      const existingTopics = await storage.listTopics()
      expect(existingTopics).toEqual(['banana', 'orange'])
      const subscriptions = await storage.getSubscribedTopics(
        'jhon.smith@contractor.com'
      )
      expect(subscriptions).toEqual(['orange'])
    })
  })

  describe('resetSubscriptions()', () => {
    it('reset subscribed topics to [] empty list', async () => {
      await storage.resetSubscriptions('jane.doe@megacoorp.com')
      const subscribedTopics = await storage.getSubscribedTopics('jane.doe@megacoorp.com')
      expect(subscribedTopics).toEqual([])
    })
  })
})
