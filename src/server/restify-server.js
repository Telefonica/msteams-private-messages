const restify = require('restify')
const { BadRequestError } = require('restify-errors')
const { log } = require('../log')

/**
 * @param {import('restify').Request} req
 */
const includeMention = req =>
  req.body.mention === true || req.body.mention === 'true'

/**
 * @param {import('restify').Request} req
 */
const ensureTopic = req =>
  req.body.createTopicIfNotExists === true ||
  req.body.createTopicIfNotExists === 'true'

/**
 * restify server in charge of:
 *  - routing to handler functions
 *  - logging requests and responses
 *  - extracting input from request (parsing)
 *  - handle HTTP status codes
 *
 * @param {Types.Handlers} param0
 */
const createRestifyServer = ({
  processMessage,
  notify,
  broadcast,
  getUsers,
  getTopics,
  createTopic,
  forceSubscription
}) => {
  const server = restify.createServer({ log })
  server.use(restify.plugins.queryParser())
  server.use(restify.plugins.bodyParser())
  server.pre(restify.plugins.pre.dedupeSlashes())

  /* log every request */
  server.pre((req, _, next) => {
    req.log.info('[>> REQUEST]', req.toString())
    next()
  })

  /* log every response */
  server.on('after', (req, res) => {
    req.log.info('[<< RESPONSE]', res.toString())
  })

  server.get('/', (_, res, next) => {
    res.send(log.fields.name)
    next()
  })

  server.get('/api/v1/users', async (_, res, next) => {
    const users = await getUsers()
    res.send(200, users)
    next()
  })

  server.get('/api/v1/topics', async (_, res, next) => {
    const topics = await getTopics()
    res.send(200, topics)
    next()
  })

  server.post('/api/v1/topics', async (req, res, next) => {
    const topic = req.body ? req.body.name : undefined
    if (!topic) {
      const err = new BadRequestError("required: 'name'")
      return next(err)
    }
    const topics = await createTopic(topic)
    res.send(200, topics)
    next()
  })

  server.put('/api/v1/topics/:topic', async (req, res, next) => {
    const user = req.body ? req.body.user : undefined
    if (!user) {
      const err = new BadRequestError("required: 'user'")
      return next(err)
    }
    const topic = req.params.topic
    const subscribers = await forceSubscription(user, topic)
    res.send(200, { subscribers })
    next()
  })

  /** Resolves 202: Accepted */
  server.post('/api/v1/messages', async (req, res, next) => {
    await processMessage(req, res)
    /* do not
     * `res.send(202)`
     *  -> headers already sent to the client
     *  -> [ERR_HTTP_HEADERS_SENT] err
     */
    next()
  })

  server.post('/api/v1/notify', async (req, res, next) => {
    const user = req.body ? req.body.user : undefined
    const message = req.body ? req.body.message : undefined
    if (!user || !message) {
      const err = new BadRequestError("required: 'user', 'message'")
      return next(err)
    }
    try {
      const conversationKey = await notify(user, message, includeMention(req))
      res.send(202, { conversationKey })
      next()
    } catch (err) {
      next(err)
    }
  })

  server.post('/api/v1/broadcast', async (req, res, next) => {
    const topic = req.body ? req.body.topic : undefined
    const message = req.body ? req.body.message : undefined
    if (!topic || !message) {
      const err = new BadRequestError("required: 'topic', 'message'")
      return next(err)
    }
    const conversationKeys = await broadcast(topic, message, {
      includeMention: includeMention(req),
      ensureTopic: ensureTopic(req)
    })
    res.send(202, { conversationKeys })
    next()
  })

  return {
    /**
     * @param {object=} param0
     * @param {number=} param0.port
     */
    start: (opts = { port: 3978 }) =>
      new Promise((resolve, reject) => {
        server.listen(opts.port, () => {
          log.info(`[STARTUP] ${server.name} listening to ${server.url}`)
          resolve()
        })
      }),

    stop: () =>
      new Promise((resolve, reject) => {
        server.close(() => {
          log.info(`[CLOSE] ${server.name} stopped`)
          resolve()
        })
      })
  }
}

module.exports = { createRestifyServer }
