const { TurnContext } = require('botbuilder')
const { log } = require('./log')

const db = {}

const createStorage = () => {
  return {
    add: activity => {
      const ref = TurnContext.getConversationReference(activity)
      const id = ref.conversation.id
      log.debug('[refs] updating conversation #%s', id)
      db[id] = ref
    }
  }
}

module.exports = { createStorage }
