const { TurnContext } = require('botbuilder')

const db = {}

const createStorage = log => {
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
