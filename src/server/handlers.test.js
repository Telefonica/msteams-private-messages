const { createHandlers } = require('./handlers')
const conversationRef = require('../fixtures/conversation-reference.json')

const adapter = {
  continueConversation: jest.fn().mockResolvedValue(),
  processActivity: jest.fn()
}
const storage = {
  getConversation: jest.fn().mockResolvedValue(conversationRef),
  getSubscribedTopics: jest.fn().mockResolvedValue(['banana', 'orange']),
  getSubscribers: jest.fn().mockResolvedValue(['jane.doe@megacoorp.com']),
  listTopics: jest.fn().mockResolvedValue(['banana', 'apple', 'orange']),
  listUsers: jest
    .fn()
    .mockResolvedValue(['jane.doe@megacoorp.com', 'jhon.smith@contractor.com']),
  registerTopic: jest.fn().mockResolvedValue(true),
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
      expect(response).toEqual({
        banana: ['jane.doe@megacoorp.com'],
        apple: ['jane.doe@megacoorp.com'],
        orange: ['jane.doe@megacoorp.com']
      })
    })
  })
})
