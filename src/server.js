const restify = require('restify')
const { log } = require('./log')

/**
 * @param {import('restify').Request} req
 */
const includeMention = req =>
  req.body.mention === true || req.body.mention === 'true'

/**
 * restify server in charge of:
 *  - routing + parsing
 *  - logging requests and responses
 *  - extracting input from request
 * @param {Types.Handlers} param0
 */
const createServer = ({
  processMessage,
  notify,
  broadcast,
  getUsers,
  getTopics,
  createTopic,
  forceSubscription
}) => {
  // TODO use log.child()
  const server = restify.createServer({ log })
  server.use(restify.plugins.queryParser())
  server.use(restify.plugins.bodyParser())

  server.listen(process.env.PORT || 3978, () => {
    log.info(`[STARTUP] ${server.name} listening to ${server.url}`)
  })

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

  server.get('/api/v1/topics', async (_, res, next) => {
    const { status, response } = await getTopics()
    res.send(status, response)
    next()
  })

  server.post('/api/v1/topics', async (req, res, next) => {
    const topic = req.body ? req.body.name : undefined
    if (!topic) {
      res.send(400, {
        code: 'BadRequest',
        required: ['name']
      })
      return next()
    }
    const { status, response } = await createTopic(topic)
    res.send(status, response)
    next()
  })

  server.post('/api/v1/topics/:topic', async (req, res, next) => {
    const user = req.body ? req.body.user : undefined
    if (!user) {
      res.send(400, {
        code: 'BadRequest',
        required: ['user'],
        got: { user }
      })
      return next()
    }
    const topic = req.params.topic
    const { status, response } = await forceSubscription(user, topic)
    res.send(status, response)
    next()
  })

  server.get('/api/v1/users', async (_, res, next) => {
    const { status, response } = await getUsers()
    res.send(status, response)
    next()
  })

  server.post('/api/v1/messages', async (req, res, next) => {
    await processMessage(req, res)
    next()
  })

  server.post('/api/v1/notify', async (req, res, next) => {
    const user = req.body ? req.body.user : undefined
    const message = req.body ? req.body.message : undefined
    if (!user || !message) {
      res.send(400, {
        code: 'BadRequest',
        required: ['user', 'message'],
        got: { user, message }
      })
      return next()
    }
    const { status, response } = await notify(
      user,
      message,
      includeMention(req)
    )
    res.send(status, response)
    next()
  })

  server.post('/api/v1/broadcast', async (req, res, next) => {
    const topic = req.body ? req.body.topic : undefined
    const message = req.body ? req.body.message : undefined
    if (!topic || !message) {
      res.send(400, {
        code: 'BadRequest',
        required: ['topic', 'message'],
        got: { topic, message }
      })
      return next()
    }
    const { status, response } = await broadcast(
      topic,
      message,
      includeMention(req)
    )
    res.send(status, response)
    next()
  })
}

module.exports = { createServer }
