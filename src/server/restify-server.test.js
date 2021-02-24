const restifyClients = require('restify-clients')
const { createRestifyServer } = require('./restify-server')

const mockedResponse = {
  status: 200,
  response: 'mocked'
}

const mockedHandlers = {
  processMessage: jest.fn().mockResolvedValue(mockedResponse),
  notify: jest.fn().mockResolvedValue(mockedResponse),
  broadcast: jest.fn().mockResolvedValue(mockedResponse),
  getUsers: jest.fn().mockResolvedValue(mockedResponse),
  getTopics: jest.fn().mockResolvedValue(mockedResponse),
  createTopic: jest.fn().mockResolvedValue(mockedResponse),
  forceSubscription: jest.fn().mockResolvedValue(mockedResponse)
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

  describe('[GET] /api/v1/users', () => {
    it("[200] routes to 'getUsers()'", done => {
      // @ts-ignore
      client.get('/api/v1/users', (_, __, res, data) => {
        expect(res.statusCode).toEqual(200)
        expect(data).toEqual('mocked')
        done()
      })
    })
  })

  describe('[GET] /api/v1/topics', () => {
    it("[200] routes to 'getTopics()'", done => {
      // @ts-ignore
      client.get('/api/v1/topics', (_, __, res, data) => {
        expect(res.statusCode).toEqual(200)
        expect(data).toEqual('mocked')
        expect(mockedHandlers.getTopics).toHaveBeenCalledWith()
        done()
      })
    })
  })

  describe('[POST] /api/v1/topics', () => {
    it("[400] requires 'name'", done => {
      client.post(
        '/api/v1/topics',
        {},
        // @ts-ignore
        (_, __, res, data) => {
          expect(res.statusCode).toEqual(400)
          expect(data).toEqual({
            code: 'BadRequest',
            required: ['name']
          })
          done()
        }
      )
    })
    it("[201] routes to 'createTopic()'", done => {
      client.post(
        '/api/v1/topics',
        { name: 'tangerine' },
        // @ts-ignore
        (_, __, res, data) => {
          expect(res.statusCode).toEqual(200) // FIXME
          expect(data).toEqual('mocked')
          expect(mockedHandlers.createTopic).toHaveBeenCalledWith('tangerine')
          done()
        }
      )
    })
  })

  describe('[POST] /api/v1/topics/{topic}', () => {
    it("[400] requires 'user'", done => {
      client.post(
        '/api/v1/topics/orange',
        {},
        // @ts-ignore
        (_, __, res, data) => {
          expect(res.statusCode).toEqual(400)
          expect(data).toEqual({
            code: 'BadRequest',
            got: {},
            required: ['user']
          })
          done()
        }
      )
    })
    it("[200] routes to 'forceSubscription()'", done => {
      client.post(
        '/api/v1/topics/orange',
        { user: 'jane.doe@megacoorp.com' },
        // @ts-ignore
        (_, __, res, data) => {
          expect(res.statusCode).toEqual(200)
          expect(data).toEqual('mocked')
          expect(mockedHandlers.forceSubscription).toHaveBeenCalledWith(
            'jane.doe@megacoorp.com',
            'orange'
          )
          done()
        }
      )
    })
  })

  describe.skip('[POST] /api/v1/messages', () => {
    it("routes to 'processMessage'", done => {
      // @ts-ignore
      client.post('/api/v1/messages', {}, () => {
        expect(mockedHandlers.processMessage).toHaveBeenCalled()
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
          required: ['user', 'message']
        })
        done()
      })
    })
    it("[200] routes to 'notify()'", done => {
      client.post(
        '/api/v1/notify',
        {
          user: 'jane@megacoorp.com',
          message: 'hi there'
        },
        // @ts-ignore
        (_, __, res, data) => {
          expect(res.statusCode).toEqual(200)
          expect(data).toEqual('mocked')
          expect(mockedHandlers.notify).toHaveBeenCalledWith(
            'jane@megacoorp.com',
            'hi there',
            false
          )
          done()
        }
      )
    })
    it("[200] routes to 'notify()'' II", done => {
      client.post(
        '/api/v1/notify',
        {
          user: 'jane@megacoorp.com',
          message: 'hi there',
          mention: true
        },
        // @ts-ignore
        (_, __, res, data) => {
          expect(res.statusCode).toEqual(200)
          expect(data).toEqual('mocked')
          expect(mockedHandlers.notify).toHaveBeenCalledWith(
            'jane@megacoorp.com',
            'hi there',
            true
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
            got: {},
            required: ['topic', 'message']
          })
          done()
        }
      )
    })
    it("[200] routes to 'broadcast()'", done => {
      client.post(
        '/api/v1/broadcast',
        { topic: 'banana', message: 'banana event' },
        // @ts-ignore
        (_, __, res, data) => {
          expect(res.statusCode).toEqual(200)
          expect(data).toEqual('mocked')
          expect(mockedHandlers.broadcast).toHaveBeenCalledWith(
            'banana',
            'banana event',
            false
          )
          done()
        }
      )
    })
    it("[200] routes to 'broadcast()' II", done => {
      client.post(
        '/api/v1/broadcast',
        { topic: 'banana', message: 'banana event', mention: true },
        // @ts-ignore
        (_, __, res, data) => {
          expect(res.statusCode).toEqual(200)
          expect(data).toEqual('mocked')
          expect(mockedHandlers.broadcast).toHaveBeenCalledWith(
            'banana',
            'banana event',
            true
          )
          done()
        }
      )
    })
  })
})
