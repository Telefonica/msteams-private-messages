/**
 * @doc https://docs.microsoft.com/en-us/microsoftteams/platform/task-modules-and-cards/cards/cards-actions
 */
const { CardFactory, MessageFactory, ActionTypes } = require('botbuilder')

const asMessage = card => MessageFactory.attachment(card)

const prepareCards = ({ config }) => {
  const menuCard = () => {
    const cardActions = config.cards.menu.map(({ title, text }) => ({
      title,
      text,
      type: ActionTypes.MessageBack
    }))
    const card = CardFactory.heroCard('title', 'text', null, cardActions)
    return asMessage(card)
  }

  return {
    menuCard
  }
}

module.exports = {
  prepareCards
}
