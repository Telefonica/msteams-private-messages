/**
 * @doc https://docs.microsoft.com/en-us/microsoftteams/platform/task-modules-and-cards/cards/cards-actions
 */
const { CardFactory, MessageFactory, ActionTypes } = require('botbuilder')

const asMessage = card => MessageFactory.attachment(card)

const simpleCard = ({ title, text }) => {
  const card = CardFactory.heroCard(title, text)
  return asMessage(card)
}

/**
 * @param {import('botbuilder').CardAction[]} cardActions
 */
const addDefaultButton = (cardActions, { title, value }) => {
  cardActions.push({
    title,
    value,
    type: ActionTypes.ImBack
  })
}

const prepareCards = ({ config }) => {
  const menuCard = () => {
    const subscriptionButtons = config.cards.menuCard.subscriptionButtons
    const cardActions = subscriptionButtons.map(({ title, value }) => ({
      title,
      value,
      type: ActionTypes.ImBack
    }))
    addDefaultButton(cardActions, config.cards.menuCard.checkButton)
    addDefaultButton(cardActions, config.cards.menuCard.resetButton)
    const title = config.cards.menuCard.title
    const menuCard = CardFactory.heroCard(title, null, cardActions)
    return asMessage(menuCard)
  }

  const registeredKeywords = () => {
    const menu = config.cards.menuCard
    return {
      check: menu.checkButton.value,
      reset: menu.resetButton.value,
      subscriptions: menu.subscriptionButtons.map(({ value }) => value)
    }
  }

  return {
    menuCard,
    registeredKeywords,
    welcomeCard: () => simpleCard(config.cards.welcomeCard),
    unknownCard: () => simpleCard(config.cards.unknownCard)
  }
}

module.exports = {
  prepareCards
}
