const restify = require('restify')
const { log } = require('./log')

const createServer = ({ onMessage, onNotify }) => {
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

  server.post('/api/messages', async (req, res, next) => {
    await onMessage(req, res)
    next()
  })

  server.post('/api/notify', async (req, res, next) => {
    const input = {} // TODO extract input from req
    const notification = await onNotify(input)
    res.send(notification)
    next()
  })
}

module.exports = { createServer }
