const restify = require('restify')
const { BadRequestError } = require('restify-errors')
const { sanitizeStr } = require('../sanitizers')
const { serverInfo } = require('../server-info')
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
 *
 *  - routing to handler functions (delegating all business-logic)
 *  - logging requests and responses
 *  - extracting input from request (parsing)
 *  - sanitize user input
 *  - handle HTTP status codes
 *
 * @param {Types.Handlers} param0
 */
const createRestifyServer = ({
  processMessage,
  notify,
  broadcast,
  getUsers,
  getUser,
  getTopics,
  getTopic,
  createTopic,
  removeTopic,
  forceSubscription,
  cancelSubscription
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

  server.get({ name: 'server info', path: '/' }, (_, res, next) => {
    res.send(serverInfo())
    next()
  })

  /** Resolves 202: Accepted */
  server.post(
    {
      name: 'botframework entrypoint',
      path: '/api/v1/messages'
    },
    async (req, res, next) => {
      try {
        await processMessage(req, res)
        /* do not
         * `res.send(202)`
         *  -> headers already sent to the client
         *  -> [ERR_HTTP_HEADERS_SENT] err
         */
        next()
      } catch (err) {
        next(err)
      }
    }
  )

  server.post(
    {
      name: 'notify',
      path: '/api/v1/notify'
    },
    async (req, res, next) => {
      const user = req.body ? req.body.user : undefined
      const message = req.body ? req.body.message : undefined
      if (!user || !message) {
        const err = new BadRequestError("required: 'user', 'message'")
        return next(err)
      }
      try {
        const userKey = sanitizeStr(user)
        const conversationKey = await notify(userKey, message, {
          includeMention: includeMention(req)
        })
        res.send(202, { conversationKey })
        next()
      } catch (err) {
        next(err)
      }
    }
  )

  server.post(
    {
      name: 'broadcast',
      path: '/api/v1/broadcast'
    },
    async (req, res, next) => {
      const topic = req.body ? req.body.topic : undefined
      /** @type {string[]} */
      const topics = req.body ? req.body.topics : undefined
      const message = req.body ? req.body.message : undefined
      // Just one of the two fields (topic or topics) must be defined
      if ((!topic && !topics) || (topic && topics) || !message) {
        const err = new BadRequestError("required: 'topics or topic', 'message'")
        return next(err)
      }
      try {
        const topicNames = topic
          ? [sanitizeStr(topic)]
          : topics.map(topic => sanitizeStr(topic))
        const conversationKeys = await broadcast(topicNames, message, {
          ensureTopic: ensureTopic(req)
        })
        res.send(202, { conversationKeys })
        next()
      } catch (err) {
        next(err)
      }
    }
  )

  server.get(
    {
      name: 'server routes',
      path: '/api/v1/admin'
    },
    (_, res, next) => {
      const { routes } = server.getDebugInfo()
      // @ts-ignore
      const response = routes.map(({ name, method, path }) => ({
        name,
        method,
        path
      }))
      res.send(200, response)
      next()
    }
  )

  server.get(
    {
      name: 'admin: get user index',
      path: '/api/v1/admin/users'
    },
    async (_, res, next) => {
      try {
        const users = await getUsers()
        res.send(200, users)
        next()
      } catch (err) {
        next(err)
      }
    }
  )

  server.get(
    {
      name: 'admin: get user detail',
      path: '/api/v1/admin/users/:user'
    },
    async (req, res, next) => {
      try {
        const userKey = sanitizeStr(req.params.user)
        const userObj = await getUser(userKey)
        res.send(200, userObj)
        next()
      } catch (err) {
        next(err)
      }
    }
  )

  server.get(
    {
      name: 'admin: get topic index',
      path: '/api/v1/admin/topics'
    },
    async (_, res, next) => {
      try {
        const topics = await getTopics()
        res.send(200, topics)
        next()
      } catch (err) {
        next(err)
      }
    }
  )

  server.post(
    {
      name: 'admin: create topic',
      path: '/api/v1/admin/topics'
    },
    async (req, res, next) => {
      const topic = req.body ? req.body.name : undefined
      if (!topic) {
        const err = new BadRequestError("required: 'name'")
        return next(err)
      }
      try {
        const topicName = sanitizeStr(topic)
        const topicObj = await createTopic(topicName)
        res.send(200, topicObj)
        next()
      } catch (err) {
        next(err)
      }
    }
  )

  server.get(
    {
      name: 'admin: get topic detail',
      path: '/api/v1/admin/topics/:topic'
    },
    async (req, res, next) => {
      try {
        const topicName = sanitizeStr(req.params.topic)
        const topicObj = await getTopic(topicName)
        res.send(200, topicObj)
        next()
      } catch (err) {
        next(err)
      }
    }
  )

  server.del(
    {
      name: 'admin: remove topic',
      path: '/api/v1/admin/topics/:topic'
    },
    async (req, res, next) => {
      try {
        const topicName = sanitizeStr(req.params.topic)
        const topics = await removeTopic(topicName)
        res.send(200, topics)
        next()
      } catch (err) {
        next(err)
      }
    }
  )

  server.put(
    {
      name: 'admin: subscribe to topic',
      path: '/api/v1/admin/topics/:topic'
    },
    async (req, res, next) => {
      const user = req.body ? req.body.user : undefined
      if (!user) {
        const err = new BadRequestError("required: 'user'")
        return next(err)
      }
      try {
        const userKey = sanitizeStr(user)
        const topicName = sanitizeStr(req.params.topic)
        const topicObj = await forceSubscription(userKey, topicName)
        res.send(200, topicObj)
        next()
      } catch (err) {
        next(err)
      }
    }
  )

  server.del(
    {
      name: 'admin: cancel subscription from topic',
      path: '/api/v1/admin/topics/:topic/:user'
    },
    async (req, res, next) => {
      try {
        const userKey = sanitizeStr(req.params.user)
        const topicName = sanitizeStr(req.params.topic)
        const topicObj = await cancelSubscription(userKey, topicName)
        res.send(200, topicObj)
        next()
      } catch (err) {
        next(err)
      }
    }
  )

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
