const { createHandlers } = require('./handlers')
const conversationRefs = require('../fixtures/conversation-reference.json')

const adapter = {
  continueConversation: jest.fn().mockResolvedValue(),
  processActivity: jest.fn()
}
const storage = {
  cancelSubscription: jest.fn().mockResolvedValue(true),
  getConversation: jest.fn().mockImplementation(/** @param {'jane.doe@megacoorp.com'|'john.doe@megacoorp.com'} user */ user => conversationRefs[user]),
  getSubscribedTopics: jest.fn().mockResolvedValue(['banana', 'orange']),
  getSubscribers: jest.fn().mockImplementation(/** @param {string} topic */ topic => {
    /** @type {Map<String, string[]>} */
    const subscribersPerTopic = new Map()
    subscribersPerTopic.set('orange', ['jane.doe@megacoorp.com'])
    subscribersPerTopic.set('banana', ['jane.doe@megacoorp.com'])
    subscribersPerTopic.set('tangerine', ['john.smith@contractor.com'])
    subscribersPerTopic.set('apple', ['john.doe@megacoorp.com'])
    return subscribersPerTopic.get(topic)
  }),
  listTopics: jest.fn().mockResolvedValue(['banana', 'apple', 'orange']),
  listUsers: jest
    .fn()
    .mockResolvedValue(['jane.doe@megacoorp.com', 'jhon.smith@contractor.com']),
  registerTopic: jest.fn().mockResolvedValue(true),
  removeSubscribers: jest.fn().mockResolvedValue(true),
  removeTopic: jest.fn().mockResolvedValue(true),
  resetSubscriptions: jest.fn().mockResolvedValue(true),
  subscribe: jest.fn().mockResolvedValue(true)
}
const bot = {
  run: jest.fn()
}

describe('createHandlers()', () => {
  // @ts-ignore
  const handlers = createHandlers(adapter, storage, bot)

  describe('handlers.processMessage()', () => {
    it("calls 'adapter.processActivity()'", async () => {
      // @ts-ignore
      await handlers.processMessage('req', 'res')
      expect(adapter.processActivity).toHaveBeenCalledWith(
        'req',
        'res',
        expect.any(Function)
      )
    })
  })

  describe('handlers.notify()', () => {
    it("calls 'adapter.continueConversation()", async () => {
      const user = 'jane.doe@megacoorp.com'
      const response = await handlers.notify(
        user,
        'Hi Jane'
      )
      expect(adapter.continueConversation).toHaveBeenCalledWith(
        conversationRefs[user],
        expect.any(Function)
      )
      expect(response).toEqual(conversationRefs[user].conversation.id)
    })
  })

  describe('handlers.broadcast()', () => {
    it("calls 'adapter.continueConversation()'", async () => {
      const user = 'jane.doe@megacoorp.com'
      const response = await handlers.broadcast(
        ['orange'],
        'an orange event did occur'
      )
      expect(adapter.continueConversation).toHaveBeenCalledWith(
        conversationRefs[user],
        expect.any(Function)
      )
      expect(response).toEqual([conversationRefs[user].conversation.id])
    })
    it("calls 'storage.registerTopic' depending on opts", async () => {
      await handlers.broadcast(['orange'], 'an orange event did occur', {
        ensureTopic: true
      })
      expect(storage.registerTopic).toHaveBeenCalledWith('orange')
    })
    it("calls 'adapter.continueConversation()' several topics to several users", async () => {
      const response = await handlers.broadcast(
        ['orange', 'apple', 'tangerine'],
        'an orange event did occur'
      )
      expect(adapter.continueConversation).toHaveBeenCalledTimes(3)
      expect(adapter.continueConversation).toHaveBeenNthCalledWith(
        1,
        conversationRefs['jane.doe@megacoorp.com'],
        expect.any(Function)
      )
      expect(adapter.continueConversation).toHaveBeenNthCalledWith(
        2,
        conversationRefs['john.doe@megacoorp.com'],
        expect.any(Function)
      )
      expect(adapter.continueConversation).toHaveBeenNthCalledWith(
        3,
        conversationRefs['john.smith@contractor.com'],
        expect.any(Function)
      )
      expect(response).toEqual([
        conversationRefs['jane.doe@megacoorp.com'].conversation.id,
        conversationRefs['john.doe@megacoorp.com'].conversation.id,
        conversationRefs['john.smith@contractor.com'].conversation.id
      ])
    })
    it("calls 'adapter.continueConversation()' several topics just one user", async () => {
      const response = await handlers.broadcast(
        ['orange', 'banana'],
        'an orange event did occur'
      )
      expect(adapter.continueConversation).toHaveBeenCalledTimes(1)
      expect(adapter.continueConversation).toHaveBeenNthCalledWith(
        1,
        conversationRefs['jane.doe@megacoorp.com'],
        expect.any(Function)
      )
      expect(response).toEqual([
        conversationRefs['jane.doe@megacoorp.com'].conversation.id
      ])
    })
  })

  describe('handlers.getUsers()', () => {
    it("returns 'storage' items", async () => {
      const response = await handlers.getUsers()
      expect(response).toEqual([
        'jane.doe@megacoorp.com',
        'jhon.smith@contractor.com'
      ])
    })
  })

  describe('handlers.getTopics()', () => {
    it("returns 'storage' items", async () => {
      const response = await handlers.getTopics()
      expect(response).toEqual(['banana', 'apple', 'orange'])
    })
  })

  describe('handlers.createTopic()', () => {
    it("calls 'storage.registerTopic()'", async () => {
      const topic = await handlers.createTopic('tangerine')
      expect(storage.registerTopic).toHaveBeenCalledWith('tangerine')
      expect(topic).toEqual({
        name: 'tangerine',
        subscribers: ['john.smith@contractor.com']
      })
    })
  })

  describe('handlers.removeTopic()', () => {
    it("calls 'storage.cancelSubscription()' & 'storage.removeTopic()'", async () => {
      const response = await handlers.removeTopic('orange')
      expect(storage.cancelSubscription).toHaveBeenCalledWith(
        'jane.doe@megacoorp.com', // getSubscribers()
        'orange'
      )
      expect(storage.removeTopic).toHaveBeenCalledWith('orange')
      expect(response).toEqual(['banana', 'apple', 'orange']) // listTopics()
    })
  })

  describe('handlers.forceSubscription()', () => {
    it("calls 'storage.subscribe()'", async () => {
      const updatedTopic = await handlers.forceSubscription(
        'john.smith@contractor.com',
        'tangerine'
      )
      expect(storage.subscribe).toHaveBeenCalledWith(
        'john.smith@contractor.com',
        'tangerine'
      )

      // updateTopic response is the value returned by the mock
      expect(updatedTopic).toEqual({
        name: 'tangerine',
        subscribers: ['john.smith@contractor.com']
      })
    })
  })

  describe('handlers.cancelSubscription()', () => {
    it("calls 'storage.cancelSubscription()", async () => {
      const updatedTopic = await handlers.cancelSubscription(
        'jhon.smith@contractor.com',
        'banana'
      )
      expect(storage.cancelSubscription).toHaveBeenCalledWith(
        'jhon.smith@contractor.com',
        'banana'
      )
      expect(updatedTopic).toEqual({
        name: 'banana',
        subscribers: ['jane.doe@megacoorp.com']
      })
    })
  })
})
