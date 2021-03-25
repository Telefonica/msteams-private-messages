const restifyClients = require('restify-clients')
const { createRestifyServer } = require('./restify-server')

const mockedHandlers = {
  /* real implementation does call res.send(); we need this behaviour for resolving the test */
  processMessage: jest.fn().mockImplementation((_, res) => res.send(202)),
  notify: jest.fn().mockResolvedValue('conversation_key_jane'),
  broadcast: jest
    .fn()
    .mockResolvedValue(['conversation_key_jane', 'conversation_key_jhon']),
  getUsers: jest
    .fn()
    .mockResolvedValue(['jane.doe@megacoorp.com', 'jhon.smith@contractor.com']),
  getUser: jest.fn().mockResolvedValue({
    user: 'jane.doe@megacoorp.com',
    subscriptions: ['banana', 'orange']
  }),
  getTopics: jest.fn().mockResolvedValue(['banana', 'orange']),
  getTopic: jest.fn().mockResolvedValue({
    name: 'orange',
    subscribers: ['jane.doe@megacoorp.com', 'jhon.smith@contractor.com']
  }),
  createTopic: jest.fn().mockResolvedValue({
    name: 'tangerine',
    subscribers: []
  }),
  removeTopic: jest.fn().mockResolvedValue(['banana', 'tangerine']),
  forceSubscription: jest.fn().mockResolvedValue({
    name: 'tangerine',
    subscribers: ['jane.doe@megacoorp.com']
  }),
  cancelSubscription: jest.fn().mockResolvedValue({
    name: 'orange',
    subscribers: ['jhon.smith@contractor.com']
  })
}

describe('createRestifyServer()', () => {
  const client = restifyClients.createJsonClient('http://127.0.0.1:3978')
  const server = createRestifyServer(mockedHandlers)

  beforeAll(done => {
    server.start().then(done)
  })

  afterAll(done => {
    server.stop().then(done)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('[GET] /api/v1/admin/users', () => {
    it('[200] routes to getUsers()', done => {
      // @ts-ignore
      client.get('/api/v1/admin/users', (_, __, res, data) => {
        expect(res.statusCode).toEqual(200)
        expect(data).toEqual([
          'jane.doe@megacoorp.com',
          'jhon.smith@contractor.com'
        ])
        expect(mockedHandlers.getUsers).toHaveBeenCalledWith()
        done()
      })
    })
  })

  describe('[GET] /api/v1/admin/users/{user}', () => {
    it('[200] routes to getUser()', done => {
      client.get(
        '/api/v1/admin/users/jane.doe%40megacoorp.com',
        // @ts-ignore
        (_, __, res, data) => {
          expect(res.statusCode).toEqual(200)
          expect(data).toEqual({
            user: 'jane.doe@megacoorp.com',
            subscriptions: ['banana', 'orange']
          })
          expect(mockedHandlers.getUser).toHaveBeenCalledWith(
            'jane.doe@megacoorp.com'
          )
          done()
        }
      )
    })
  })

  describe('[GET] /api/v1/admin/topics', () => {
    it('[200] routes to getTopics()', done => {
      client.get(
        '/api/v1/admin/topics',
        // @ts-ignore
        (_, __, res, data) => {
          expect(res.statusCode).toEqual(200)
          expect(data).toEqual(['banana', 'orange'])
          expect(mockedHandlers.getTopics).toHaveBeenCalledWith()
          done()
        }
      )
    })
  })

  describe('[POST] /api/v1/admin/topics', () => {
    it("[400] requires 'name'", done => {
      client.post(
        '/api/v1/admin/topics',
        {},
        // @ts-ignore
        (_, __, res, data) => {
          expect(res.statusCode).toEqual(400)
          expect(data).toEqual({
            code: 'BadRequest',
            message: "required: 'name'"
          })
          done()
        }
      )
    })

    it('[200] routes to createTopic()', done => {
      client.post(
        '/api/v1/admin/topics',
        { name: 'tangerine' },
        // @ts-ignore
        (_, __, res, data) => {
          expect(res.statusCode).toEqual(200)
          expect(data).toEqual({
            name: 'tangerine',
            subscribers: []
          })
          expect(mockedHandlers.createTopic).toHaveBeenCalledWith('tangerine')
          done()
        }
      )
    })
  })

  describe('[GET] /api/v1/admin/topics/{topic}', () => {
    it('[200] routes to getTopic()', done => {
      client.get(
        '/api/v1/admin/topics/orange',
        // @ts-ignore
        (_, __, res, data) => {
          expect(res.statusCode).toEqual(200)
          expect(data).toEqual({
            name: 'orange',
            subscribers: ['jane.doe@megacoorp.com', 'jhon.smith@contractor.com']
          })
          expect(mockedHandlers.getTopic).toHaveBeenCalledWith('orange')
          done()
        }
      )
    })
  })

  describe('[DELETE] /api/v1/admin/topics/{topic}', () => {
    it('[200] routes to removeTopic()', done => {
      // @ts-ignore
      client.del('/api/v1/admin/topics/orange', (_, __, res, data) => {
        expect(res.statusCode).toEqual(200)
        expect(data).toEqual(['banana', 'tangerine'])
        expect(mockedHandlers.removeTopic).toHaveBeenCalledWith('orange')
        done()
      })
    })
  })

  describe('[PUT] /api/v1/admin/topics/{topic}', () => {
    it("[400] requires 'user'", done => {
      client.put(
        '/api/v1/admin/topics/tangerine',
        {},
        // @ts-ignore
        (_, __, res, data) => {
          expect(res.statusCode).toEqual(400)
          expect(data).toEqual({
            code: 'BadRequest',
            message: "required: 'user'"
          })
          done()
        }
      )
    })

    it('[200] routes to forceSubscription()', done => {
      client.put(
        '/api/v1/admin/topics/tangerine',
        { user: 'jane.doe@megacoorp.com' },
        // @ts-ignore
        (_, __, res, data) => {
          expect(res.statusCode).toEqual(200)
          expect(data).toEqual({
            name: 'tangerine',
            subscribers: ['jane.doe@megacoorp.com']
          })
          expect(mockedHandlers.forceSubscription).toHaveBeenCalledWith(
            'jane.doe@megacoorp.com',
            'tangerine'
          )
          done()
        }
      )
    })
  })

  describe('[DELETE] /api/v1/admin/topics/{topic}/{user}', () => {
    it('[200] routes to cancelSubscription()', done => {
      client.del(
        '/api/v1/admin/topics/orange/jane.doe%40megacoorp.com',
        // @ts-ignore
        (_, __, res, data) => {
          expect(res.statusCode).toEqual(200)
          expect(data).toEqual({
            name: 'orange',
            subscribers: ['jhon.smith@contractor.com']
          })
          expect(mockedHandlers.cancelSubscription).toHaveBeenCalledWith(
            'jane.doe@megacoorp.com',
            'orange'
          )
          done()
        }
      )
    })
  })

  describe('[POST] /api/v1/messages', () => {
    it('routes to processMessage()', done => {
      // @ts-ignore
      client.post('/api/v1/messages', {}, (_, __, res) => {
        expect(mockedHandlers.processMessage).toHaveBeenCalled()
        expect(res.statusCode).toEqual(202)
        done()
      })
    })
  })

  describe('[POST] /api/v1/notify', () => {
    it("[400] requires 'user' & 'message'", done => {
      // @ts-ignore
      client.post('/api/v1/notify', {}, (_, __, res, data) => {
        expect(res.statusCode).toEqual(400)
        expect(data).toEqual({
          code: 'BadRequest',
          message: "required: 'user', 'message'"
        })
        done()
      })
    })
    it('[202] routes to notify()', done => {
      client.post(
        '/api/v1/notify',
        {
          user: 'jane@megacoorp.com',
          message: 'hi there'
        },
        // @ts-ignore
        (_, __, res, data) => {
          expect(res.statusCode).toEqual(202)
          expect(data).toEqual({
            conversationKey: 'conversation_key_jane'
          })
          expect(mockedHandlers.notify).toHaveBeenCalledWith(
            'jane@megacoorp.com',
            'hi there',
            { includeMention: false }
          )
          done()
        }
      )
    })

    it('[202] routes to notify() (considering mention)', done => {
      client.post(
        '/api/v1/notify',
        {
          user: 'jane@megacoorp.com',
          message: 'hi there',
          mention: true
        },
        // @ts-ignore
        (_, __, res, data) => {
          expect(res.statusCode).toEqual(202)
          expect(data).toEqual({
            conversationKey: 'conversation_key_jane'
          })
          expect(mockedHandlers.notify).toHaveBeenCalledWith(
            'jane@megacoorp.com',
            'hi there',
            { includeMention: true }
          )
          done()
        }
      )
    })
  })

  describe('[POST] /api/v1/broadcast', () => {
    it("[400] requires 'topic' & 'message'", done => {
      client.post(
        '/api/v1/broadcast',
        {},
        // @ts-ignore
        (_, __, res, data) => {
          expect(res.statusCode).toEqual(400)
          expect(data).toEqual({
            code: 'BadRequest',
            message: "required: 'topic', 'message'"
          })
          done()
        }
      )
    })

    it('[202] routes to broadcast()', done => {
      client.post(
        '/api/v1/broadcast',
        { topic: 'orange', message: 'orange event' },
        // @ts-ignore
        (_, __, res, data) => {
          expect(res.statusCode).toEqual(202)
          expect(data).toEqual({
            conversationKeys: ['conversation_key_jane', 'conversation_key_jhon']
          })
          expect(mockedHandlers.broadcast).toHaveBeenCalledWith(
            'orange',
            'orange event',
            { ensureTopic: false }
          )
          done()
        }
      )
    })

    it('[202] routes to broadcast() (considering topic creation)', done => {
      client.post(
        '/api/v1/broadcast',
        {
          topic: 'orange',
          message: 'orange event',
          createTopicIfNotExists: true
        },
        // @ts-ignore
        (_, __, res, data) => {
          expect(mockedHandlers.broadcast).toHaveBeenCalledWith(
            'orange',
            'orange event',
            { ensureTopic: true }
          )
          done()
        }
      )
    })
  })
})
