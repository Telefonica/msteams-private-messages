const restify = require('restify')

const start = ({ appInfo, log, onMessage, onNotify }) => {
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
    res.send(appInfo)
    next()
  })

  server.post('/api/messages', async (req, res, next) => {
    await onMessage()
    next()
  })

  server.post('/api/notify', async (req, res, next) => {
    await onNotify(req, res)
    next()
  })
}

module.exports = { start }
