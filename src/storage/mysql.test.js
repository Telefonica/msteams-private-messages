const conversationRefs = require('../fixtures/conversation-reference.json')

jest.mock('../../db/sequelize/models')
const { sequelize: db } = require('../../db/sequelize/models')

const { storage } = require('./mysql')

/*
 * mocked scenario
 * --------------------------------------------------------------------
 *  jane.doe@megacoorp.com    -- subscribed to --> [ banana, orange ]
 *  jhon.smith@contractor.com -- subscribed to --> [ orange, apple ]
 * --------------------------------------------------------------------
 */
const orange = {
  id: 1,
  name: 'orange',
  // @ts-ignore
  subscribers: [],
  setSubscribers: jest.fn()
}
const banana = {
  id: 2,
  name: 'banana',
  // @ts-ignore
  subscribers: [],
  setSubscribers: jest.fn()
}
const apple = {
  id: 3,
  name: 'apple',
  // @ts-ignore
  subscribers: [],
  setSubscribers: jest.fn()
}
const jane = {
  user: 'jane.doe@megacoorp.com',
  conversationKey: '16123xxxxxxxx',
  conversationRef: conversationRefs['jane.doe@megacoorp.com'],
  subscriptions: [banana, orange],
  setSubscriptions: jest.fn(),
  removeSubscription: jest.fn(),
  save: jest.fn()
}
const jhon = {
  user: 'jhon.smith@contractor.com',
  conversationKey: '16123yyyyyyyy',
  conversationRef: conversationRefs['john.smith@contractor.com'],
  subscriptions: [orange, apple]
}
orange.subscribers = [jane, jhon]
banana.subscribers = [jane]
apple.subscribers = [jhon]
/* --- mocked scenario --- */

describe('mysql.storage', () => {
  afterEach(() => {
    db.models.Users.mockClear()
    db.models.Topics.mockClear()
  })

  describe('getConversation()', () => {
    it('recovers the conversation reference', async () => {
      db.models.Users.findOne.mockResolvedValue(jane)
      const conversation = await storage.getConversation(
        'jane.doe@megacoorp.com'
      )
      expect(conversation).toBe(conversationRefs['jane.doe@megacoorp.com'])
      expect(db.models.Users.findOne).toHaveBeenCalledWith({
        where: { user: 'jane.doe@megacoorp.com' }
      })
    })
  })

  describe('saveConversation()', () => {
    it('overrides existing conversation reference', async () => {
      const newConversationRef = { ...conversationRefs['jane.doe@megacoorp.com'] }
      newConversationRef.conversation.id = 'NEW CONVERSATION ID'
      db.models.Users.findOrCreate.mockResolvedValue([jane, false])
      jane.save.mockResolvedValue(true)
      const success = await storage.saveConversation(
        'jane.doe@megacoorp.com',
        newConversationRef
      )
      expect(success).toBe(true)
      expect(jane.conversationKey).toEqual('NEW CONVERSATION ID')
      expect(jane.conversationRef).toBe(newConversationRef)
      expect(jane.save).toHaveBeenCalled()
    })
  })

  describe('listUsers()', () => {
    it('returns user keys as plain strings', async () => {
      db.models.Users.findAll.mockResolvedValue([jane, jhon])
      const users = await storage.listUsers()
      expect(users).toEqual([
        'jane.doe@megacoorp.com',
        'jhon.smith@contractor.com'
      ])
    })
  })

  describe('listTopics()', () => {
    it('returns topics names as plain strings', async () => {
      db.models.Topics.findAll.mockResolvedValue([orange, banana, apple])
      const topics = await storage.listTopics()
      expect(topics).toEqual(['orange', 'banana', 'apple'])
    })
  })

  describe('getSubscribedTopics()', () => {
    it('returns subscribed topic names as plain strings', async () => {
      db.models.Users.findOne.mockResolvedValue(jane)
      const subscribedTopics = await storage.getSubscribedTopics(
        'jane.doe@megacoorp.com'
      )
      expect(subscribedTopics).toEqual(['banana', 'orange'])
    })
  })

  describe('getSubscribers()', () => {
    // FIXME: <<TypeError: Converting circular structure to JSON>>
    it.skip('returns subscriber users keys as plain strings', async () => {
      db.models.Topics.findOne.mockResolvedValue(orange)
      const subscribers = await storage.getSubscribers('orange')
      expect(subscribers).toEqual([jane, jhon])
    })
  })

  describe('cancelSubscription()', () => {
    it('ignores unknown users', async () => {
      db.models.Users.findOne.mockResolvedValue(null)
      const success = await storage.cancelSubscription(
        'fake.person@nowhere.com',
        'banana'
      )
      expect(success).toBe(false)
    })
    it('ignores unknown topics', async () => {
      db.models.Users.findOne.mockResolvedValue(jane)
      db.models.Topics.findOne.mockResolvedValue(null)
      const success = await storage.cancelSubscription(
        'jane.doe@megacoorp.com',
        'does-not-exist'
      )
      expect(success).toBe(false)
    })
    // FIXME actually db.models.<model> seems to not be working,
    // both models are resolving the last mock
    // (in this case <banana>)
    it.skip('cancels the subscription to the topic', async () => {
      db.models.Users.findOne.mockResolvedValue(jane)
      db.models.Topics.findOne.mockResolvedValue(banana)
      jane.removeSubscription.mockResolvedValue(1)
      const success = await storage.cancelSubscription(
        'jane.doe@megacoorp.com',
        'banana'
      )
      expect(success).toBe(true)
      expect(jane.removeSubscription).toHaveBeenCalledWith(2) // banana.id
    })
  })

  describe('removeTopic()', () => {
    it('cancels subscription of any user to the topic & removes it', async () => {
      db.models.Topics.findOne.mockResolvedValue(banana)
      db.models.Topics.destroy.mockResolvedValue(1)
      const success = await storage.removeTopic('banana')
      expect(success).toBe(true)
      expect(banana.setSubscribers).toHaveBeenCalledWith([])
      expect(db.models.Topics.destroy).toHaveBeenCalledWith({
        where: { name: 'banana' }
      })
    })
  })

  describe('resetSubscriptions()', () => {
    it('reset subscribed topics to [] empty list', async () => {
      db.models.Users.findOne.mockResolvedValue(jane)
      await storage.resetSubscriptions('jane.doe@megacoorp.com')
      expect(jane.setSubscriptions).toHaveBeenCalledWith([])
    })
  })
})
