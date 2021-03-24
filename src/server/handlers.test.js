const { createHandlers } = require('./handlers')
const conversationRef = require('../fixtures/conversation-reference.json')

const adapter = {
  continueConversation: jest.fn().mockResolvedValue(),
  processActivity: jest.fn()
}
const storage = {
  cancelSubscription: jest.fn().mockResolvedValue(true),
  getConversation: jest.fn().mockResolvedValue(conversationRef),
  getSubscribedTopics: jest.fn().mockResolvedValue(['banana', 'orange']),
  getSubscribers: jest.fn().mockResolvedValue(['jane.doe@megacoorp.com']),
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
      const response = await handlers.notify(
        'jane.doe@megacoorp.com',
        'Hi Jane'
      )
      expect(adapter.continueConversation).toHaveBeenCalledWith(
        conversationRef,
        expect.any(Function)
      )
      expect(response).toEqual(conversationRef.conversation.id)
    })
  })

  describe('handlers.broadcast()', () => {
    it("calls 'adapter.continueConversation()'", async () => {
      const response = await handlers.broadcast(
        'orange',
        'an orange event did occur'
      )
      expect(adapter.continueConversation).toHaveBeenCalledWith(
        conversationRef,
        expect.any(Function)
      )
      expect(response).toEqual([conversationRef.conversation.id])
    })
    it("calls 'storage.registerTopic' depending on opts", async () => {
      await handlers.broadcast('orange', 'an orange event did occur', {
        ensureTopic: true
      })
      expect(storage.registerTopic).toHaveBeenCalledWith('orange')
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
        subscribers: ['jane.doe@megacoorp.com']
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
        'jane.doe@megacoorp.com',
        'tangerine'
      )
      expect(storage.subscribe).toHaveBeenCalledWith(
        'jane.doe@megacoorp.com',
        'tangerine'
      )
      expect(updatedTopic).toEqual({
        name: 'tangerine',
        subscribers: ['jane.doe@megacoorp.com']
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
